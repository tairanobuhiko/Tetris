// Jest の環境初期化
import 'react-native-gesture-handler/jestSetup';

try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch {
  // RN 0.81 以降は NativeAnimatedHelper が別パスに移動しているため存在しないことがある
}
