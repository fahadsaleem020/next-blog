import { Box, HStack, Avatar, Textarea } from "@chakra-ui/react";
import {
  ChangeEvent,
  useEffect,
  useRef,
  memo,
  FC,
  useCallback,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
} from "react";
import { useEmoji } from "@components/emojiProvider";
import CommentFormControls from "@components/comment/commentFormControls";
import { ArticleDoc } from "@models/index";
import { MergeId } from "@Types/api";
import { useUser } from "@components/stores";

const CommentForm: FC<{
  article: Required<MergeId<ArticleDoc>>;
  uploadHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  uploadState: [boolean, Dispatch<SetStateAction<boolean>>];
}> = ({ article, uploadState, uploadHandler }) => {
  const user = useUser(useCallback((state) => state.user, []));
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [chosenEmoji, _, commentValue, setCommentValue] = useEmoji()!;

  useEffect(() => {
    if (chosenEmoji) {
      textAreaRef.current!.value += chosenEmoji.emoji;
      setTimeout(() => {
        setCommentValue(textAreaRef.current!.value);
      }, 1000);
    }
  }, [chosenEmoji]);
  uploadHandler;
  const changeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      setCommentValue(e.target.value);
    }, 1000);
  };

  return (
    <HStack alignItems={"start"}>
      <Avatar src={user?.photo ?? ""} name={user?.username} size="sm" />
      <Box flex={1}>
        <Textarea ref={textAreaRef} onChange={changeHandler} />
        <CommentFormControls
          uploadHandler={uploadHandler}
          article={article}
          uploadState={uploadState}
        />
      </Box>
    </HStack>
  );
};

export default memo(CommentForm);
