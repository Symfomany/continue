import styled from "styled-components";
import { vscForeground } from "../..";

interface OnboardingCardTabsProps {
  activeTab: TabTitle;
  onTabClick: (tabName: TabTitle) => void;
}

export type TabTitle = "Quickstart" | "Best" | "Local";

export const TabTitles: { [k in TabTitle]: { md: string; default: string } } = {
  Quickstart: {
    md: "Quickstart",
    default: "Quickstart",
  },
  Best: {
    md: "Best",
    default: "Best experience",
  },
  Local: {
    md: "Local",
    default: "Local with Ollama",
  },
};

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  background-color: transparent;
  color: ${vscForeground};
  border: none;
  border-bottom: 1px solid ${vscForeground};
  border-radius: 0;
  font-size: 1rem;
  cursor: pointer;
  display: block;

  &:focus {
    outline: none;
  }
`;

const TabButton = styled.button<{ isActive: boolean }>`
  margin-bottom: -1px;
  focus: outline-none;
  background: transparent;
  cursor: pointer;
  color: ${vscForeground};
  border: none;

  ${({ isActive }) =>
    isActive &&
    `
    border-style: solid;
    border-width: 0 0 2.5px 0;
    border-color: ${vscForeground};
    font-weight: bold;
  `}
`;

const TabList = styled.div`
  border-style: solid;
  border-width: 0 0 0.5px 0;
  border-color: ${vscForeground};
`;

export function OnboardingCardTabs({
  activeTab,
  onTabClick,
}: OnboardingCardTabsProps) {
  return (
    <div>
      
    </div>
  );
}
