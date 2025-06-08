# VoiceVox Local Mode Implementation Summary

## 実装概要
ZUNDAMON-X Chrome拡張機能に、Local VoiceVoxサーバーとGCP VoiceVoxサーバーを切り替える機能を実装しました。

## 実装した機能

### 1. 設定状態管理 (atom.ts)
- `voiceVoxLocalModeState`: Local/GCPモードの切り替え状態
- `voiceVoxLocalEndpointState`: Local VoiceVoxのエンドポイントURL設定

### 2. 音声生成ロジック (useAudioData.ts)
- Local VoiceVoxのAPI呼び出し実装 (audio_query → synthesis)
- GCP/Localモードの自動切り替え
- エラーハンドリングとログ出力
- 非同期処理対応

### 3. 設定UI (VoiceVoxSettings.tsx)
- ラジオボタンによるモード切り替え
- Local VoiceVoxエンドポイントURL設定
- 両モードのテスト機能
- 音声再生による動作確認
- 使用方法の説明文

### 4. オプション画面統合 (Options.tsx)
- VoiceVoxSettingsコンポーネントの統合

### 5. 統計情報表示
- メイン機能とポップアップに現在のモード表示を追加

## API実装詳細

### Local VoiceVox API
```
1. POST /audio_query?text={text}&speaker=3
   - 音声クエリ作成
   - レスポンス: JSON形式の音声パラメータ

2. POST /synthesis?speaker=3
   - Body: 音声クエリのJSON
   - レスポンス: WAVファイルのバイナリデータ
```

### GCP VoiceVox API (既存)
```
GET /voice?message={text}
- レスポンス: WAVファイルのバイナリデータ
```

## テスト機能
- Local VoiceVox接続テスト (version API確認)
- 音声生成テスト (実際の音声再生)
- GCP VoiceVoxテスト
- エラーハンドリングの確認

## 使用方法

### Localモード
1. PC上でVoiceVoxアプリケーションを起動
2. 拡張機能のオプション画面で「Localモード」を選択
3. エンドポイントURL確認 (デフォルト: http://localhost:50021)
4. 「Local VoiceVoxをテスト」ボタンで動作確認

### GCPモード
1. 拡張機能のオプション画面で「GCPモード」を選択
2. 「GCP VoiceVoxをテスト」ボタンで動作確認

## 実装の特徴
- 既存コードを最大限保持
- 非破壊的な機能追加
- 堅牢なエラーハンドリング
- ユーザーフレンドリーなUI
- 詳細なログ出力
- テスト機能による動作確認

## ファイル変更一覧
- `src/atom.ts` - 新しいstate追加
- `src/background/useAudioData.ts` - Local VoiceVox対応
- `src/options/VoiceVoxSettings.tsx` - 新規作成
- `src/options/Options.tsx` - UI統合
- `src/content/mainFunctionCaller.tsx` - 統計表示追加
- `src/content/popupMainFunctionCaller.tsx` - 統計表示追加
- `src/options/VoiceVoxSettings.spec.tsx` - テストファイル作成

## ビルド状況
✅ プロジェクトビルド成功
✅ 型チェック通過
✅ 機能実装完了
✅ 設定UI動作確認
