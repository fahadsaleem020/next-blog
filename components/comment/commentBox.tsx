import { NextPage } from "next";
import { Box, BoxProps } from "@chakra-ui/react";
import CommentForm from "@components/comment/commentForm";
import { Dispatch, memo, MouseEventHandler, SetStateAction } from "react";
import { ArticleDoc } from "@models/index";
import { MergeId } from "@Types/api";

const CommentBox: NextPage<
  BoxProps & {
    article: Required<MergeId<ArticleDoc>>;
    uploadHandler: MouseEventHandler<HTMLButtonElement> | undefined;
    uploadState: [boolean, Dispatch<SetStateAction<boolean>>];
  }
> = ({ children, article, uploadState, uploadHandler, ...rest }) => {
  return (
    <Box {...rest}>
      <CommentForm
        article={article}
        uploadHandler={uploadHandler}
        uploadState={uploadState}
      />
    </Box>
  );
};

export default memo(CommentBox);
