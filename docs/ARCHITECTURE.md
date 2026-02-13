# ZUNDAMON-X アプリケーション概要とコード構造

## アプリケーションの概要
**ZUNDAMON-X** は、YouTube上の英語動画の字幕を取得し、それを「ずんだもん」などのVOICEVOXキャラクターの声で日本語に翻訳・読み上げを行うChrome拡張機能です。

### 主な機能
1.  **字幕取得**: YouTubeの字幕データを自動的に取得します。
2.  **音声生成**: 取得した字幕テキストをサーバー（Cloud Functions）に送信し、音声データ（WAV）を生成します。
3.  **同期再生**: 動画の再生時刻に合わせて、生成された音声を再生します。
4.  **UI表示**:
    *   **ポップアップ**: 現在の字幕、再生状況、音量調整、読み上げのON/OFF切り替え。
    *   **オプションページ**: 読み上げキャラクターやスタイルの変更。
    *   **ずんだもん表示**: 画面上にキャラクターを表示し、口パクなどのアニメーションを行います。

---

## コード構造 (Directory Structure)

`src` ディレクトリ以下に主要なコードが配置されています。

### 1. `src/content` (Content Scripts)
YouTubeのウェブページ上で直接動作するスクリプト群です。
*   **`index.tsx`**: コンテンツスクリプトのエントリーポイント。ReactコンポーネントをDOMに注入します。
*   **`mainFunctionCaller.tsx` (Backend Logic)**: 動画の再生状態監視、字幕ごとの音声生成リクエストの発行など、裏側のコアロジックを担当します。
*   **`features/`**: 各種ヘルパー関数（感情分析 `getEmotionType.ts` など）。

### 2. `src/popup` (Popup UI)
拡張機能のアイコンをクリックした際に表示されるポップアップウィンドウのUIです。
*   **`Popup.tsx`**: ポップアップのメインコンポーネント。
*   **`mainFunctionCaller.tsx` (UI Logic)**: `Volume-can-be-adjusted` ブランチから移植された、リッチなUI（Tremor使用）を持つコンポーネント。ユーザー操作（音量、オプション遷移）を受け持ちます。
*   **`AudioAnalyzer.tsx`**: 音声の波形データを可視化・処理するコンポーネント。
*   **`ZundamonModel.tsx`**: キャラクターのアニメーション表示を担当。
*   **`background/`**: `new-run` ブランチ独自の構成で、UIコンポーネントから利用されるAPI呼び出し関数などが格納されています。
    *   `useAudioData.ts`: 音声合成APIへのリクエスト（Cloud Functionsへ接続）。
    *   `getTranscript.ts`: 字幕APIへのリクエスト。

### 3. `src/options` (Options Page)
拡張機能の設定ページです。
*   **`CharactersSelector.tsx`**: キャラクター選択画面。`character_image_path.json` の画像URLを使用してキャラクター一覧を表示します。

### 4. `src/background` (Service Worker)
Chrome拡張のバックグラウンドプロセスです。
*   ブラウザイベントのハンドリングや、コンテンツスクリプトとポップアップ間の通信を仲介します。

### 5. 状態管理と型定義 (State & Types)
UIとバックエンドロジックの競合を避けるため、定義ファイルが分離されています。

*   **UI用 (Frontend)**:
    *   **`src/types_ui.ts`**: UIコンポーネントで使用される型定義。
    *   **`src/atom_ui.ts`**: UIコンポーネントで使用されるRecoilのアトム（状態）。
*   **バックエンド用 (Backend/Content)**:
    *   **`src/types.ts`**: 既存のロジックやコンテンツスクリプトで使用される型定義。
    *   **`src/atom.ts`**: 既存のロジックで使用されるRecoilのアトム。

## 技術スタック
*   **言語**: TypeScript
*   **フレームワーク**: React
*   **ビルドツール**: Vite
*   **スタイリング**: Tailwind CSS, Tremor (UIコンポーネントライブラリ)
*   **状態管理**: Recoil
*   **バックエンド**: Firebase Cloud Functions (Python/FastAPI想定)
*   **音声合成**: VOICEVOX
