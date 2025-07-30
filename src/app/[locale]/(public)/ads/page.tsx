import AdsPage from "@/components/pages/Ads/AdsPage";
export const metadata = {
  title: "الإعلانات",
  description: "الإعلانات",
};


export default async function Index() {
  return (
    <div>
      <AdsPage />
    </div>
  );
}
