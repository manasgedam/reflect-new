"use client"

import FormBuilder from "@/app/_components/formBuilder";
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/Sidebar";
import ResponseSummary from "@/app/_components/ResponseSummary";
import IndividualResponses from "@/app/_components/IndividualResponses";
import QuestionReports from "@/app/_components/QuestionReports";

export default function page() {
  const router = useRouter();
  const params = useParams();
  const slugString = Array.isArray(params.slug) ? params.slug[0] : params.slug || "0";
  const slug = parseInt(slugString, 10);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(slug);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    if (!slugString) {
      router.replace("/form-builder/0");
    } else if (slug !== activeSection) {
      setActiveSection(slug);
    }
  }, [slugString, slug, activeSection]);

  const svgTemplate = `
    <svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
      <defs>
        <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%">
          <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="161" result="effect1_foregroundBlur"></feGaussianBlur>
        </filter>
      </defs>
      <rect width="900" height="600" fill="COLOR1"></rect>
      <g filter="url(#blur1)">
        <circle cx="462" cy="474" fill="COLOR2" r="357"></circle>
        <circle cx="253" cy="110" fill="COLOR1" r="357"></circle>
        <circle cx="812" cy="325" fill="COLOR2" r="357"></circle>
        <circle cx="770" cy="66" fill="COLOR2" r="357"></circle>
        <circle cx="680" cy="512" fill="COLOR1" r="357"></circle>
        <circle cx="85" cy="353" fill="COLOR2" r="357"></circle>
      </g>
    </svg>
  `;

  const color1 = '#76c1ff';
  const color2 = '#cbfdff';
  const svgWithColors = svgTemplate
    .replace(/COLOR1/g, color1)
    .replace(/COLOR2/g, color2);

  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(svgWithColors)}`;

  return (
    <div>
      <div className="bg-paper flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="flex flex-1">
          <Sidebar
            active={activeSection}
            isCollapsed={isSidebarCollapsed} />
          <div className="flex-1 rounded-md bg-white bg-cover bg-no-repeat m-3 ml-0">
            {activeSection === 0 && <FormBuilder />}
            {activeSection === 1 && <ResponseSummary />}
            {activeSection === 2 && <IndividualResponses />}
            {activeSection === 3 && <QuestionReports />}
            {activeSection === 4 && <div>Actionable Insights Content</div>}
            {activeSection === 5 && <div>Form Settings Content</div>}
            {activeSection === 6 && <div>Settings Content</div>}
            {activeSection === 7 && <div>Notifications Content</div>}
            {activeSection === 8 && <div>Sign Out Content</div>}
          </div>
        </div>
      </div>
    </div>
  )
}