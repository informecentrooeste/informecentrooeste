import {
  useAdminListNews,
  useAdminCreateNews,
  useAdminUpdateNews,
  useAdminDeleteNews,
  useAdminPublishNews as useAdminPublishNewsBase,
  useAdminArchiveNews as useAdminArchiveNewsBase,
  useAdminListCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminToggleCategoryStatus,
  useAdminListBanners,
  useAdminCreateBanner,
  useAdminUpdateBanner,
  useAdminDeleteBanner,
  useAdminToggleBannerStatus,
  useAdminListVideos,
  useAdminCreateVideo,
  useAdminUpdateVideo,
  useAdminDeleteVideo,
  useAdminToggleVideoStatus,
  useAdminListUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminToggleUserStatus,
  useAdminGetDashboardStats,
  useAdminGetSettings,
  useAdminUpdateSettings,
  useAdminGetAuditLogs,
  useAdminUploadFile,
  type AdminListNewsParams,
  type AdminListUsersParams,
  type AdminGetAuditLogsParams
} from "@workspace/api-client-react";
import { getAuthHeaders } from "./use-auth";
import { useQueryClient } from "@tanstack/react-query";

// Base request configuration generator for admin routes
const req = () => ({ headers: getAuthHeaders() });

// Dashboard
export const useDashboardStats = () => useAdminGetDashboardStats({ request: req() });

// News
export const useAdminNews = (params?: AdminListNewsParams) => useAdminListNews(params, { request: req() });
export const useCreateNews = () => {
  const qc = useQueryClient();
  return useAdminCreateNews({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/news"] }) } });
};
export const useUpdateNews = () => {
  const qc = useQueryClient();
  return useAdminUpdateNews({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/news"] }) } });
};
export const useDeleteNews = () => {
  const qc = useQueryClient();
  return useAdminDeleteNews({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/news"] }) } });
};
export const useAdminPublishNews = () => {
  const qc = useQueryClient();
  return useAdminPublishNewsBase({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/news"] }) } });
};
export const useAdminArchiveNews = () => {
  const qc = useQueryClient();
  return useAdminArchiveNewsBase({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/news"] }) } });
};

// Categories
export const useAdminCategories = () => useAdminListCategories({ request: req() });
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useAdminCreateCategory({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/categories"] }) } });
};
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useAdminUpdateCategory({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/categories"] }) } });
};
export const useToggleCategoryStatus = () => {
  const qc = useQueryClient();
  return useAdminToggleCategoryStatus({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/categories"] }) } });
};

// Banners
export const useAdminBanners = () => useAdminListBanners({ request: req() });
export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useAdminCreateBanner({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/banners"] }) } });
};
export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useAdminUpdateBanner({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/banners"] }) } });
};
export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useAdminDeleteBanner({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/banners"] }) } });
};
export const useToggleBannerStatus = () => {
  const qc = useQueryClient();
  return useAdminToggleBannerStatus({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/banners"] }) } });
};

// Videos
export const useAdminVideos = () => useAdminListVideos({ request: req() });
export const useCreateVideo = () => {
  const qc = useQueryClient();
  return useAdminCreateVideo({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/videos"] }) } });
};
export const useUpdateVideo = () => {
  const qc = useQueryClient();
  return useAdminUpdateVideo({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/videos"] }) } });
};
export const useDeleteVideo = () => {
  const qc = useQueryClient();
  return useAdminDeleteVideo({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/videos"] }) } });
};
export const useToggleVideoStatus = () => {
  const qc = useQueryClient();
  return useAdminToggleVideoStatus({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/videos"] }) } });
};

// Users
export const useAdminUsers = (params?: AdminListUsersParams) => useAdminListUsers(params, { request: req() });
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useAdminCreateUser({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/users"] }) } });
};
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useAdminUpdateUser({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/users"] }) } });
};
export const useToggleUserStatus = () => {
  const qc = useQueryClient();
  return useAdminToggleUserStatus({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/users"] }) } });
};

// Settings
export const useAdminSettings = () => useAdminGetSettings({ request: req() });
export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useAdminUpdateSettings({ request: req(), mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/settings"] }) } });
};

// Audit
export const useAdminAuditLogs = (params?: AdminGetAuditLogsParams) => useAdminGetAuditLogs(params, { request: req() });

// Upload
export const useUploadFile = () => useAdminUploadFile({ request: req() });
