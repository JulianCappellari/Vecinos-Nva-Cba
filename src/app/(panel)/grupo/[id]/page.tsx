import { redirect } from "next/navigation";

// Los grupos se muestran en el listado; esta ruta no tiene vista propia.
export default function GrupoPage() {
  redirect("/grupos");
}
