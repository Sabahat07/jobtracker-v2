import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { Application, ParsedJobDescription, ResumeSuggestion } from "../types";
import toast from "react-hot-toast";
import axios from "axios";

const errMsg = (e: unknown) =>
  axios.isAxiosError(e)
    ? ((e.response?.data as { message?: string })?.message ?? "Something went wrong")
    : "Something went wrong";

export const useApplications = () =>
  useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await api.get<{ applications: Application[] }>("/applications");
      return data.applications;
    },
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Application>) => {
      const { data } = await api.post<{ application: Application }>("/applications", payload);
      return data.application;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Application saved! 🎉"); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Application> & { id: string }) => {
      const { data } = await api.put<{ application: Application }>(`/applications/${id}`, payload);
      return data.application;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Updated!"); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/applications/${id}`); return id; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["applications"] }); toast.success("Deleted"); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useParseJD = () =>
  useMutation({
    mutationFn: async (jobDescription: string) => {
      const { data } = await api.post<{ parsed: ParsedJobDescription; suggestions: ResumeSuggestion[] }>("/ai/parse", { jobDescription });
      return data;
    },
    onError: (e) => toast.error(errMsg(e)),
  });
