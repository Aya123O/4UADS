import { useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { create } from "zustand";
import { useEffect } from "react";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "paused" | "completed" | "error" | "tempPaused";
  xhr?: XMLHttpRequest;
  relativePath?: string;
  uploadedChunks: number;
  totalChunks: number;
}

interface NetworkStatus {
  isOnline: boolean;
}

interface UploadStore {
  files: UploadFile[];
  addFiles: (newFiles: UploadFile[]) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadFile["status"]) => void;
  removeFile: (id: string) => void;
  updateFileXHR: (id: string, xhr: XMLHttpRequest) => void;
  updateUploadedChunks: (id: string, chunks: number) => void;
  pauseAllUploads: () => void;
  resumeAllUploads: () => void;
  areAllUploadsPaused: () => boolean;
  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;
  tempPauseAll: () => void;
  tempResumeAll: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  files: [],
  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),
  updateFileProgress: debounce(
    (id, progress) =>
      set((state) => ({
        files: state.files.map((file) =>
          file.id === id ? { ...file, progress } : file
        ),
      })),
    100
  ), // Debounce with a delay of 100ms
  updateFileStatus: (id, status) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, status } : file
      ),
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),
  updateFileXHR: (id, xhr) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, xhr } : file
      ),
    })),
  updateUploadedChunks: (id, chunks) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, uploadedChunks: chunks } : file
      ),
    })),
  pauseAllUploads: () =>
    set((state) => ({
      files: state.files.map((file) => {
        if (file.status === "uploading" && file.xhr) {
          file.xhr.abort(); // Abort the XHR request
          return { ...file, status: "paused" as const };
        }
        return file;
      }),
    })),
  resumeAllUploads: () =>
    set((state) => ({
      files: state.files.map((file) => {
        if (file.status === "paused") {
          return { ...file, status: "uploading" as const };
        }
        return file;
      }),
    })),
  areAllUploadsPaused: () => {
    const { files } = get();
    return files.every((file) => file.status !== "uploading");
  },
  networkStatus: {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  },
  setNetworkStatus: (status) => set({ networkStatus: status }),
  tempPauseAll: () =>
    set((state) => ({
      files: state.files.map((file) => {
        if (file.status === "uploading" && file.xhr) {
          file.xhr.abort(); // Abort the XHR request
          return { ...file, status: "tempPaused" };
        }
        return file;
      }),
    })),
  tempResumeAll: () =>
    set((state) => ({
      files: state.files.map((file) => {
        if (file.status === "tempPaused") {
          return { ...file, status: "uploading" };
        }
        return file;
      }),
    })),
}));

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export const useFileUpload = () => {
  const queryClient = useQueryClient();
  const {
    updateFileProgress,
    updateFileStatus,
    updateFileXHR,
    updateUploadedChunks,
  } = useUploadStore();

  const uploadChunk = async (file: UploadFile, start: number, end: number) => {
    const chunk = file.file.slice(start, end);
    const xhr = new XMLHttpRequest();
    const fileName = file.file.name;
    const folderPath = file.relativePath ? `/${file.relativePath}` : "";

    // Remove the file extension from the path if it's already included in the file name
    const pathWithoutExtension = folderPath.endsWith(
      `.${fileName.split(".").pop()}`
    )
      ? folderPath.substring(0, folderPath.lastIndexOf("."))
      : folderPath;

    // Construct the URL without duplicating the file extension
    const url = `https://objectstorage.me-jeddah-1.oraclecloud.com/p/6oDfLPFMTQgocdx2he-sWjfTfT-89gmKGo0dTjQXTJQvuOQF04O5OCuFO9H6FYuQ/n/axvpvthrjz64/b/madeen_dam/o${pathWithoutExtension}/${encodeURIComponent(fileName)}`;

    return new Promise<void>((resolve, reject) => {
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.file.type);
      xhr.setRequestHeader(
        "Content-Range",
        `bytes ${start}-${end - 1}/${file.file.size}`
      );
      xhr.setRequestHeader("opc-meta-name", `d/${fileName}`);

      updateFileXHR(file.id, xhr);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const totalProgress = ((start + event.loaded) / file.file.size) * 100;
          updateFileProgress(file.id, totalProgress);
        }
      };

      xhr.send(chunk);
    });
  };

  return useMutation({
    mutationFn: async (file: UploadFile) => {
      for (let i = file.uploadedChunks; i < file.totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.file.size);

        // Add a check for online status before uploading each chunk
        while (typeof navigator !== "undefined" && !navigator.onLine) {
          await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 1000); // Wait for 1 second before checking again
          });
        }

        await uploadChunk(file, start, end);
        updateUploadedChunks(file.id, i + 1);
      }
    },
    onMutate: (file) => {
      updateFileStatus(file.id, "uploading");
    },
    onSuccess: (_, file) => {
      updateFileStatus(file.id, "completed");
      updateFileProgress(file.id, 100);
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
    onError: (_, file) => {
      updateFileStatus(file.id, "error");
    },
  });
};

export const useMultiFileUpload = () => {
  const uploadMutation = useFileUpload();
  const { addFiles } = useUploadStore();

  const uploadMultipleFiles = (
    files: { file: File; relativePath?: string }[]
  ) => {
    const newFiles = files.map(({ file, relativePath }) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading" as const,
      relativePath,
      uploadedChunks: 0,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    }));

    addFiles(newFiles);

    newFiles.forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  return { uploadMultipleFiles };
};

export const usePauseResumeUpload = () => {
  const {
    files,
    updateFileStatus,
    pauseAllUploads,
    resumeAllUploads,
    areAllUploadsPaused,
    tempPauseAll,
    tempResumeAll,
  } = useUploadStore();
  const uploadMutation = useFileUpload();

  const pauseUpload = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file && file.xhr && file.status === "uploading") {
      file.xhr.abort();
      updateFileStatus(id, "paused");
    }
  };

  const resumeUpload = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file && file.status === "paused") {
      updateFileStatus(id, "uploading");
      uploadMutation.mutate(file);
    }
  };

  const handlePauseAll = () => {
    pauseAllUploads();
    files.forEach((file) => {
      if (file.status === "uploading") {
        pauseUpload(file.id);
      }
    });
  };

  const handleResumeAll = () => {
    resumeAllUploads();
    files.forEach((file) => {
      if (file.status === "paused") {
        resumeUpload(file.id);
      }
    });
  };

  const handleTempPauseAll = () => {
    tempPauseAll();
  };

  const handleTempResumeAll = () => {
    tempResumeAll();
    files.forEach((file) => {
      if (file.status === "tempPaused") {
        uploadMutation.mutate(file);
      }
    });
  };

  return {
    pauseUpload,
    resumeUpload,
    handlePauseAll,
    handleResumeAll,
    areAllUploadsPaused,
    handleTempPauseAll,
    handleTempResumeAll,
  };
};

export const useNetworkStatus = () => {
  const { setNetworkStatus } = useUploadStore();

  useEffect(() => {
    const handleOnline = () => setNetworkStatus({ isOnline: true });
    const handleOffline = () => setNetworkStatus({ isOnline: false });

    // Add this line to return a default value when window is undefined
    return () => {};
  }, [setNetworkStatus]);

  // Return the current network status
  return useUploadStore.getState().networkStatus;
};
