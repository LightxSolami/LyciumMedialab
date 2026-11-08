import html from "../content/magazine.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function MagazinePage() {
  return <HtmlView page="magazine" html={html} />;
}
