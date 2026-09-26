import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { TranslationKey } from "@/localization/translations";
import { useAppSettings } from "@/providers/AppProviders";
import type { ProtocolContentFailureStatus } from "@/providers/ProtocolContentProvider";
import { spacing, typography } from "@/theme/tokens";

const failureMessages: Record<ProtocolContentFailureStatus, TranslationKey> = {
  missing: "protocolMissing",
  "storage-error": "protocolStorageError",
  invalid: "protocolInvalid",
  incompatible: "protocolIncompatible",
  "not-effective": "protocolNotEffective",
  expired: "protocolExpired",
  retired: "protocolRetired",
  unapproved: "protocolUnapproved",
  "integrity-failed": "protocolIntegrityFailed",
  "signature-invalid": "protocolSignatureInvalid",
  "not-found": "protocolNotFound",
};

type ProtocolStatusViewProps = {
  status: "loading" | ProtocolContentFailureStatus;
};

export function protocolStatusMessageKey(status: ProtocolContentFailureStatus): TranslationKey {
  return failureMessages[status];
}

export function ProtocolStatusView({ status }: ProtocolStatusViewProps) {
  const { colors, t } = useAppSettings();
  const loading = status === "loading";

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { borderColor: colors.border }]}
      testID={`protocol-status-${status}`}
    >
      <Ionicons
        accessible={false}
        color={loading ? colors.primary : colors.emergencyForeground}
        name={loading ? "hourglass-outline" : "shield-outline"}
        size={24}
      />
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {t(loading ? "protocolLoadingTitle" : "protocolUnavailableTitle")}
        </Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {t(loading ? "protocolLoadingBody" : protocolStatusMessageKey(status))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.label,
    fontWeight: "700",
  },
  body: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
