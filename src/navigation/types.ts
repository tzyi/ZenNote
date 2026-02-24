import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer';

// Root Stack - manages main flow and modals
export type RootStackParamList = {
  Drawer: undefined;
  Editor: { noteId?: string } | undefined;
  RecycleBin: undefined;
  TagAggregate: { tagName: string };
};

// Drawer - the sidebar navigation
export type DrawerParamList = {
  Main: undefined;
  Search: undefined;
  Settings: undefined;
  DailyReview: undefined;
};

// Navigation prop types
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type DrawerNavigationPropType = DrawerNavigationProp<DrawerParamList>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type DrawerScreenPropsType<T extends keyof DrawerParamList> =
  DrawerScreenProps<DrawerParamList, T>;
