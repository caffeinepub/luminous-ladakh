import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CommunityLink,
  DashboardStats,
  ModerationCounts,
  PaymentInfo,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCommunityLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityLink[]>({
    queryKey: ["communityLinks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCommunityLinks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function usePaymentInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentInfo>({
    queryKey: ["paymentInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getPaymentInfo();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useModerationCounts() {
  const { actor, isFetching } = useActor();
  return useQuery<ModerationCounts>({
    queryKey: ["moderationCounts"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getModerationCounts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });
}

export function useAddCommunityLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      url,
      iconType,
    }: {
      title: string;
      url: string;
      iconType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addCommunityLink(title, url, iconType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communityLinks"] }),
  });
}

export function useEditCommunityLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      url,
      iconType,
    }: {
      id: bigint;
      title: string;
      url: string;
      iconType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.editCommunityLink(id, title, url, iconType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communityLinks"] }),
  });
}

export function useDeleteCommunityLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCommunityLink(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communityLinks"] }),
  });
}
