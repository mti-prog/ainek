"use client"

import { useEffect, useState } from "react"

interface TenantInfo {
  slug: string
  id: string | null
  name: string | null
}

export function useTenant(): TenantInfo {
  const [tenant, setTenant] = useState<TenantInfo>({
    slug: "",
    id: null,
    name: null,
  })

  useEffect(() => {
    const hostname = window.location.hostname
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "ainek.kg"
    let slug = ""

    if (hostname.endsWith(`.${appDomain}`)) {
      slug = hostname.replace(`.${appDomain}`, "")
    } else {
      slug = new URLSearchParams(window.location.search).get("tenant") ?? ""
    }

    if (slug) {
      fetch(`/api/tenant/info?slug=${slug}`)
        .then((r) => r.json())
        .then((data) => setTenant({ slug, id: data.id, name: data.name }))
        .catch(() => setTenant({ slug, id: null, name: null }))
    }
  }, [])

  return tenant
}
