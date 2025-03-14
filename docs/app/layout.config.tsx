import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="12" fill="#4e15b8" />
          <g
            transform="translate(2.5, 2.5)"
            stroke="#ffffff"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 10.5a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8"></path>
            <path d="M6 10.5a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8"></path>
            <path d="M15 13.5a3.5 3.5 0 0 0 0 -7h-.5"></path>
            <path d="M16.5 6.8v-2.8a3.5 3.5 0 0 0 -7 0"></path>
            <path d="M4 13.5a3.5 3.5 0 0 1 0 -7h.5"></path>
            <path d="M2.5 6.8v-2.8a3.5 3.5 0 0 1 7 0v10"></path>
          </g>
        </svg>
        Contaigents
      </>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
