import { AppBreadcrumbs } from "@/components/app-breadcrumbs";

type Props = {
  params: Promise<{
    catchAll: string[];
  }>;
};
export default async function BreadcrumbSlot(props: Props) {
  const params = await props.params;

  const {
    catchAll
  } = params;

  return <AppBreadcrumbs routes={catchAll} />;
}
