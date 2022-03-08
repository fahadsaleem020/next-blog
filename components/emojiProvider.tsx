import { IEmojiData } from "emoji-picker-react";
import {
  createContext,
  FC,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

const EmojiContext = createContext<
  | [
      IEmojiData | null,
      Dispatch<SetStateAction<IEmojiData | null>>,
      string | null,
      Dispatch<SetStateAction<string | null>>
    ]
  | null
>(null);
export const useEmoji = () => useContext(EmojiContext);

const EmojiProvider: FC = ({ children }) => {
  const [chosenEmoji, setChosenEmoji] = useState<IEmojiData | null>(null);
  const [commentValue, setCommentValue] = useState<string | null>(null);

  return (
    <EmojiContext.Provider
      value={[chosenEmoji, setChosenEmoji, commentValue, setCommentValue]}
    >
      {children}
    </EmojiContext.Provider>
  );
};

export default EmojiProvider;
