import html from "../content/community.html?raw";
import { HtmlView } from "../components/HtmlView";

export default function CommunityPage() {
  return <HtmlView page="community" html={html} />;
}
