import UserDashboard from "@/app/_components/userDashboard";

export default function Page({ params }: { params: { id: string } }) {
  return <UserDashboard formId={params.id} />;
}