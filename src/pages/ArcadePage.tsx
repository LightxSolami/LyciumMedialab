import html from "../content/arcade.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function ArcadePage() {
  return <HtmlView page="arcade" html={html} />;
}
