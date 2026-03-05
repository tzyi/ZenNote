import React, { useMemo, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Platform, Image, View, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useColors } from '../theme';
import type { ColorScheme } from '../theme';

// ─── MarkdownImage ────────────────────────────────────────────────────────────
// 自動偵測圖片原始尺寸並計算正確的 aspectRatio，解決 RN Image 預設 0×0 問題。
interface MarkdownImageProps {
  src: string;
  alt?: string;
  style: any;
}

function MarkdownImage({ src, alt, style }: MarkdownImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;
    setHasError(false);
    Image.getSize(
      src,
      (w, h) => setAspectRatio(h > 0 ? w / h : 1),
      () => setHasError(true),
    );
  }, [src]);

  if (hasError) {
    return (
      <View style={[style, imgStyles.errorBox]}>
        <Text style={imgStyles.errorText}>⚠ 圖片無法顯示</Text>
      </View>
    );
  }

  // 取得尺寸前先以預設比例佔位，避免畫面跳動
  return (
    <Image
      style={[style, { width: '100%', aspectRatio: aspectRatio ?? 16 / 9 }]}
      source={{ uri: src }}
      resizeMode="contain"
      accessible={!!alt}
      accessibilityLabel={alt || undefined}
    />
  );
}

const imgStyles = StyleSheet.create({
  errorBox: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: '#888',
    fontSize: 13,
  },
});

// ─── markdownRules ────────────────────────────────────────────────────────────
// 修正 react-native-markdown-display 預設 image rule 中
// key 被 spread 進 JSX 而觸發的 React 警告，同時改用 MarkdownImage 確保尺寸正確。
const markdownRules = {
  image: (node: any, _children: any, _parent: any, styles: any) => {
    const { src, alt } = node.attributes as { src: string; alt?: string };
    const imageStyle = styles._VIEW_SAFE_image ?? styles.image;
    return <MarkdownImage key={node.key} src={src} alt={alt} style={imageStyle} />;
  },
};

interface MarkdownPreviewProps {
  content: string;
}

function buildMarkdownStyles(colors: ColorScheme) {
  return StyleSheet.create({
    body: {
      color: colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '700' as const,
      marginTop: 16,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 8,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '700' as const,
      marginTop: 14,
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 6,
    },
    heading3: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '600' as const,
      marginTop: 12,
      marginBottom: 4,
    },
    heading4: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600' as const,
      marginTop: 10,
      marginBottom: 4,
    },
    heading5: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600' as const,
      marginTop: 8,
      marginBottom: 4,
    },
    heading6: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600' as const,
      marginTop: 8,
      marginBottom: 4,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 10,
    },
    strong: {
      fontWeight: '700' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    s: {
      textDecorationLine: 'line-through' as const,
    },
    link: {
      color: colors.accentBlue,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      backgroundColor: colors.surfaceVariant,
      borderLeftWidth: 4,
      borderLeftColor: colors.accentGreen,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },
    code_inline: {
      backgroundColor: colors.surfaceVariant,
      color: colors.accentOrange,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    code_block: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    fence: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    hr: {
      backgroundColor: colors.divider,
      height: 1,
      marginVertical: 16,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      flexDirection: 'row' as const,
      marginVertical: 2,
    },
    bullet_list_icon: {
      color: colors.accentGreen,
      fontSize: 16,
      marginRight: 8,
    },
    ordered_list_icon: {
      color: colors.accentGreen,
      fontSize: 16,
      marginRight: 8,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: colors.surfaceVariant,
    },
    th: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      fontWeight: '600' as const,
    },
    tr: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    td: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
    },
    image: {
      borderRadius: 8,
      marginVertical: 8,
    },
  });
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const colors = useColors();
  const markdownStyles = useMemo(() => buildMarkdownStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Markdown style={markdownStyles} rules={markdownRules}>{content}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
});
