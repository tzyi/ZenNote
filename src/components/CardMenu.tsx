import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { useColors } from '../theme';

export interface CardMenuAction {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface CardMenuProps {
  visible: boolean;
  actions: CardMenuAction[];
  onClose: () => void;
}

export function CardMenu({ visible, actions, onClose }: CardMenuProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.menu,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => {
                action.onPress();
                onClose();
              }}
              style={[
                styles.menuItem,
                index < actions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <Text style={styles.menuIcon}>{action.icon}</Text>
              <Text
                style={[
                  styles.menuLabel,
                  { color: action.destructive ? colors.accentRed : colors.textPrimary },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
