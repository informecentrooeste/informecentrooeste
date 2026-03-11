import {
  useGetPublicNews,
  useGetPublicNewsArticle,
  useGetPublicCategories,
  useGetPublicFeaturedNews,
  useGetPublicLatestNews,
  useGetPublicMostRead,
  useGetPublicSidebarNews,
  useGetPublicVideos,
  useGetPublicBanners,
  useSearchPublicNews,
  useGetPublicSettings,
  type GetPublicNewsParams,
  type SearchPublicNewsParams,
  type GetPublicBannersParams
} from "@workspace/api-client-react";

export const usePublicNews = (params?: GetPublicNewsParams) => useGetPublicNews(params);
export const usePublicArticle = (slug: string) => useGetPublicNewsArticle(slug);
export const usePublicCategories = () => useGetPublicCategories();
export const usePublicFeaturedNews = () => useGetPublicFeaturedNews();
export const usePublicLatestNews = (limit = 5) => useGetPublicLatestNews({ limit });
export const usePublicMostRead = (limit = 5) => useGetPublicMostRead({ limit });
export const usePublicSidebarNews = (category?: string, limit = 3) => useGetPublicSidebarNews({ category, limit });
export const usePublicVideos = () => useGetPublicVideos();
export const usePublicBanners = (params?: GetPublicBannersParams) => useGetPublicBanners(params);
export const usePublicSearch = (params: SearchPublicNewsParams) => useSearchPublicNews(params, { query: { enabled: !!params.q } });
export const usePublicSettings = () => useGetPublicSettings();
