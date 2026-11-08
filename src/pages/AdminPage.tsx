import html from "../content/admin.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function AdminPage() {
  return <HtmlView page="admin" html={html} />;
}
