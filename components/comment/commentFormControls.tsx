import { Box, HStack, Button, IconButton } from "@chakra-ui/react";
import {
  MouseEvent,
  useState,
  memo,
  FC,
  MouseEventHandler,
  Dispatch,
  SetStateAction,
} from "react";
import dynamic from "next/dynamic";
import { IEmojiData } from "emoji-picker-react";
import { GrEmoji } from "react-icons/gr";
import { useEmoji } from "@components/emojiProvider";
import { ArticleDoc, Comments } from "@models/index";
import { MergeId } from "@Types/api";
import axios from "axios";
import { getAccessToken } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { ApiResponse } from "@Types/global";

const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <>loading...</>,
});

const CommentFormControls: FC<{
  article: Required<MergeId<ArticleDoc>>;
  uploadHandler: MouseEventHandler<HTMLButtonElement> | undefined;
  uploadState: [boolean, Dispatch<SetStateAction<boolean>>];
}> = ({ article, uploadHandler, uploadState }) => {
  //
  const [_, setChosenEmoji] = useEmoji()!;
  const [isPicker, setIsPicker] = useState(false);

  const onEmojiClick = (event: MouseEvent, emojiObject: IEmojiData) => {
    setChosenEmoji(emojiObject);
  };

  return (
    <HStack justifyContent="flex-end" mt="4">
      <Box position={"relative"}>
        <IconButton
          onClick={() => setIsPicker((prev) => !prev)}
          colorScheme={"blue"}
          variant="ghost"
          _focus={{ outline: "none" }}
          rounded="full"
          icon={<GrEmoji size={34} />}
          aria-label="emoji button"
        />
        <Box
          top={10}
          left={0}
          position="absolute"
          display={isPicker ? "block" : "none"}
        >
          <Picker
            onEmojiClick={onEmojiClick}
            disableAutoFocus={true}
            disableSkinTonePicker={true}
          />
        </Box>
      </Box>
      <Button
        _focus={{ outline: "none" }}
        colorScheme={"blue"}
        onClick={uploadHandler}
        isLoading={uploadState[0]}
      >
        post
      </Button>
    </HStack>
  );
};

export const commmentUploadFunction = async (comment: Comments) => {
  const { token } = await getAccessToken(csrfToken);
  const body = { comment, accessToken: token };
  return (await (
    await axios.post("/api/uploadComment", body)
  ).data) as ApiResponse & { insertedId: string };
};

export default memo(CommentFormControls);
