import HomePage from "@/components/pages/HomePage/HomePage";
import Head from "next/head";
export const metadata = {
  title: "الصفحة الرئيسية",
  description: " الصفحة الرئيسية لموقعنا",
};

export default async function Index() {
  // make title of page
  const title = "Home Page";
  return (
    <div>
      <Head>
        <title>My page title</title>
      </Head>

      <HomePage />
    </div>
  );
}
