import { useEffect, useRef } from "react";

interface SeoMetaProps {
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
}

function upsertMeta(
  attribute: "name" | "property",
  attrValue: string,
  content: string,
) {
  let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attribute: "name" | "property", value: string) {
  document.querySelector(`meta[${attribute}="${value}"]`)?.remove();
}

export function SeoMeta({
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  twitterCard,
}: SeoMetaProps) {
  const tags = useRef<{ attribute: "name" | "property"; value: string }[]>([]);

  useEffect(() => {
    tags.current = [];

    if (description != null) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
      tags.current.push(
        { attribute: "name", value: "description" },
        { attribute: "property", value: "og:description" },
        { attribute: "name", value: "twitter:description" },
      );
    }
    if (ogTitle != null) {
      upsertMeta("property", "og:title", ogTitle);
      upsertMeta("name", "twitter:title", ogTitle);
      tags.current.push(
        { attribute: "property", value: "og:title" },
        { attribute: "name", value: "twitter:title" },
      );
    }
    if (ogDescription != null) {
      upsertMeta("property", "og:description", ogDescription);
      tags.current.push({
        attribute: "property",
        value: "og:description",
      });
    }
    if (ogImage != null) {
      upsertMeta("property", "og:image", ogImage);
      upsertMeta("name", "twitter:image", ogImage);
      tags.current.push(
        { attribute: "property", value: "og:image" },
        { attribute: "name", value: "twitter:image" },
      );
    }
    if (ogUrl != null) {
      upsertMeta("property", "og:url", ogUrl);
      tags.current.push({ attribute: "property", value: "og:url" });
    }
    if (ogType != null) {
      upsertMeta("property", "og:type", ogType);
      tags.current.push({ attribute: "property", value: "og:type" });
    }
    if (twitterCard != null) {
      upsertMeta("name", "twitter:card", twitterCard);
      tags.current.push({
        attribute: "name",
        value: "twitter:card",
      });
    }

    return () => {
      for (const { attribute, value } of tags.current) {
        removeMeta(attribute, value);
      }
    };
  }, [
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
  ]);

  return null;
}
