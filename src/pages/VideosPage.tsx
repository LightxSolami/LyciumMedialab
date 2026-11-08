import html from "../content/videos.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function VideosPage() {
  return <HtmlView page="videos" html={html} />;
}
