import html from "../content/presentation.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function PresentationPage() {
  return <HtmlView page="presentation" html={html} />;
}
