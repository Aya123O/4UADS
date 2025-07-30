import AdsPage from "../../../../components/pages/ads/page";
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
