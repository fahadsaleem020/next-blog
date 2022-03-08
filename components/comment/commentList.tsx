import { ArticleDoc, Comments, Replies } from "@models/index";
import {
  useState,
  memo,
  FC,
  useCallback,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
} from "react";
import {
  Avatar,
  HStack,
  Box,
  BoxProps,
  Text,
  Button,
  IconButton,
  StackProps,
  Stack,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  AiOutlineLike,
  AiOutlineDislike,
  AiOutlineComment,
  AiOutlineDelete,
  AiOutlineEdit,
} from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineCancel } from "react-icons/md";
import { LoaderBody, LoaderContainer } from "@components/loader";
import { useUser } from "@components/stores";
import axios from "axios";
import { getAccessToken } from "@components/authMethods";
import { csrfToken } from "@config/csrfToken.config";
import { MergeId } from "@Types/api";
import Moment from "react-moment";
import { ApiResponse } from "@Types/global";
import { fetcher, useComments } from "@withSWR/allComments";
import CommentBox from "@components/comment/commentBox";
import { useEmoji } from "@components/emojiProvider";
import { commmentUploadFunction } from "@components/comment/commentFormControls";
import { mutate } from "swr";
import { RepliesContext } from "@components/RepliesProvider";

type CommentsWithId = Comments & { _id: string };
type CommentObjectType = [
  {
    comment: CommentsWithId;
    parentId: string;
    mode: "replying" | "deleting" | "expand";
  } | null,

  Dispatch<
    SetStateAction<{
      comment: CommentsWithId;
      parentId: string;
      mode: "replying" | "deleting" | "expand";
    } | null>
  >
];

const CommentList: FC<
  {
    comments: CommentsWithId[];
    article: Required<MergeId<ArticleDoc>>;
  } & BoxProps
> = ({ comments, article, ...rest }) => {
  //
  const { mutate: Mutate } = useComments(`/api/comments?postId=${article._id}`);
  const [, , commentValue] = useEmoji()!;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser(useCallback((state) => state.user, []));
  const [commentObject, setCommentObject] =
    useState<CommentObjectType[0]>(null);
  const [replyObject, setReplyObject] = useContext(RepliesContext);

  //delete comment handler
  const deleteCommentHandler = async (
    comment: CommentsWithId & {
      parentId: string;
    }
  ) => {
    setCommentObject({
      mode: "deleting",
      comment: comment,
      parentId: comment.parentId,
    });

    const { token } = await getAccessToken(csrfToken);
    const { status, statusCode }: ApiResponse = await (
      await axios.post("/api/deleteComment", {
        comment,
        accessToken: token,
      })
    ).data;

    if (status && statusCode === 200) {
      //if it's a reply then filter reply object from provider;
      if (!comment.isRoot) {
        const parent = replyObject!.filter(
          (val) => val.comment._id === comment.parentId
        )[0];
        const extractedChild = parent.nestedComments.filter(
          (val) => val._id === comment._id
        );

        const index = parent.nestedComments.indexOf(extractedChild[0]);
        parent.nestedComments.splice(index);

        // decrement parent count from either replyObject or comments(mutate);
        const isParentRoot = parent.comment.isRoot;
        if (isParentRoot) {
          mutate(
            "allComments",
            fetcher(`/api/comments?postId=${article._id}`),
            false
          );
        } else if (!isParentRoot) {
          const parent = replyObject!.filter(
            (val) => val.comment._id === comment._id
          )[0];
          //finding the parent
          // const extractedChild = parent.nestedComments.filter(
          //   (val) => val._id === comment._id
          // )[0];
          console.log(parent);
        }
        console.log("inside reply logic");

        setCommentObject(null);
      } else {
        console.log("inside root logic");
        //get root comment from replyObject from provider and remove it(this doesn't renders the ui, so to mutate root comments);
        const rootComment = replyObject?.filter(
          (val) => val.comment._id === comment._id
        )[0];

        const index = replyObject?.indexOf(rootComment as never);
        replyObject?.splice(index!);

        //mutating root comments locally;
        const filteredRootComments = {
          comments: comments.filter((val) => val._id !== comment._id),
        };

        mutate("allComments", filteredRootComments, false);
        setCommentObject(null);
      }
    } else {
      alert("failed to delete comment");
      setCommentObject(null);
      //mutating comment list globally;
      mutate(
        "allComments",
        fetcher(`/api/comments?postId=${article._id}`),
        false
      );
    }
  };

  //comment reply handler;
  const ReplyCommentHandler = async () => {
    setIsSubmitting(true);

    //parent resides inside comment object state;
    const parent: CommentsWithId =
      commentObject && (commentObject as any).comment;
    const parentId: CommentsWithId =
      commentObject && (commentObject as any).parentId;

    //setting up reply object to post;
    const reply: Replies & { _id?: string } = {
      body: commentValue!,
      identity: parent.identity,
      by: user!.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      postId: article._id,
      isRoot: false,
      photo: user!.photo ?? "",
      parentId: parent._id,
    };

    if (!reply.body || !(reply.body.trim().length >= 5)) {
      alert("Atleast 5 characters long!");
      return setIsSubmitting(false);
    }

    //filtering reply object;
    const filteredReplyObject = replyObject?.filter(
      (val) => val.comment._id === parent._id
    );

    const { status, statusCode, insertedId } = await commmentUploadFunction(
      reply
    );

    //add insertedId to reply object;
    reply._id = insertedId;
    if (status && statusCode === 200) {
      setIsSubmitting(false);
      if (filteredReplyObject && filteredReplyObject.length) {
        console.log("parent found");
        //if parent found push into comments array;
        filteredReplyObject[0].nestedComments.push(reply as any);
        if (parent.isRoot) {
          console.log("and is root"); //done
          const rootComment = comments.filter((val) => val._id === parent._id);
          ++rootComment[0].replyCount!;
        } else {
          //here  //working
          const rootComment = replyObject!.filter(
            (val) => val.comment._id === parent._id
          );
          console.log("and is not root");
          ++rootComment[0].comment.replyCount!;
        }
      } else if (filteredReplyObject && !filteredReplyObject.length) {
        //here //working
        console.log("parent not found");
        parent.replyCount! = 1;
        setReplyObject!((prev) => [
          ...prev,
          { comment: parent as any, nestedComments: [reply as any] },
        ]);
      } else {
        //remove this entire block;
        console.log("replying to root");
        //fill reply object for the first time
        setReplyObject!([reply as any]);
      }

      setCommentObject(null);
    } else {
      alert("failed to post comment!");
      setIsSubmitting(false);
    }
  };

  //gets all comment and puts it in comment state;
  const fetchReplies = async (parent: CommentsWithId) => {
    const currentReplyObject = replyObject!.filter(
      (val) => val.comment._id === parent._id
    )[0];
    //prevents from refeching;

    if (currentReplyObject) return null;

    const params = new URLSearchParams({
      isReplies: "true",
      parentId: parent._id,
    });

    const replies: Replies[] = await (
      await axios.get("/api/comments", { params })
    ).data.comments;

    //set reply object;
    setReplyObject!((prev) => [
      ...prev,
      { comment: parent as any, nestedComments: replies as any },
    ]);
  };

  return (
    <Box {...rest}>
      {comments.map((val, i) => {
        if (
          commentObject &&
          commentObject.comment._id === val._id &&
          commentObject.mode === "deleting"
        )
          return (
            <LoaderContainer h="5rem">
              <LoaderBody margin="auto" color="alpha.azure.600" />
            </LoaderContainer>
          );

        return (
          <Box key={i} py={3} my={2}>
            <HStack alignItems={"start"} spacing={4}>
              <Avatar src={val.photo} size="sm" name={val.by} />
              <Box w="full">
                <Box
                  border="1px solid"
                  borderColor="beta.gray.300"
                  p={4}
                  rounded="lg"
                >
                  <HStack justifyContent={"space-between"}>
                    <Box>
                      <Heading as={"h4"} size="xs" textTransform={"capitalize"}>
                        {val.by}
                        <Moment
                          style={{
                            marginLeft: "1em",
                            color: "grey",
                            fontSize: ".8em",
                          }}
                          format="D MMMM YYYY"
                        >
                          {val.updatedAt}
                        </Moment>
                      </Heading>
                    </Box>

                    {user && user.username === val.by && (
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<BsThreeDotsVertical color="grey" />}
                          aria-label="comment options"
                          bg="transparent"
                          _focus={{ outline: "none" }}
                        />

                        <MenuList>
                          <MenuItem icon={<AiOutlineEdit />}>Edit</MenuItem>
                          <MenuItem
                            icon={<AiOutlineDelete />}
                            onClick={() => deleteCommentHandler(val as any)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                  </HStack>
                  <Text>{val.body}</Text>
                </Box>
                <CommentListControls
                  toggleRepliesButton={
                    val.replyCount ? (
                      <Button
                        colorScheme="blue"
                        variant="ghost"
                        rounded="full"
                        size="sm"
                        ml={4}
                        _focus={{ outline: "none" }}
                        onClick={() => fetchReplies(val)}
                      >
                        {`show replies (${val.replyCount})`}
                      </Button>
                    ) : (
                      <></>
                    )
                  }
                  commentObject={commentObject}
                  comment={val}
                  comments={comments}
                  mt={3}
                  setCommentObject={setCommentObject}
                />
                {/* render reply form */}
                {commentObject &&
                  commentObject.comment._id === val._id &&
                  commentObject.mode === "replying" && (
                    <CommentBox
                      article={article}
                      mt={4}
                      uploadState={[isSubmitting, setIsSubmitting]}
                      uploadHandler={ReplyCommentHandler}
                    />
                  )}
                {/* render replies */}
                {replyObject!.length > 0 &&
                  replyObject!.some((v) => v.comment._id === val._id) && (
                    <CommentList
                      article={article}
                      comments={
                        replyObject!.filter((v) => v.comment._id === val._id)[0]
                          .nestedComments as any
                      }
                    />
                  )}
              </Box>
            </HStack>
          </Box>
        );
      })}
    </Box>
  );
};

const CommentListControls: FC<
  {
    comment: CommentsWithId;
    comments: CommentsWithId[];
    commentObject: CommentObjectType[0];
    setCommentObject: CommentObjectType[1];
    toggleRepliesButton: ReactNode;
  } & StackProps
> = ({
  comment,
  comments,
  commentObject,
  setCommentObject,
  toggleRepliesButton,
  ...rest
}) => {
  // const [_, setChosenEmoji, commentValue] = useEmoji()!;
  // const user = useUser(useCallback((state) => state.user, []));

  //render comment box;
  const replyButtonHandler = async (comment: CommentsWithId) => {
    //toggle comment box;
    if (
      commentObject &&
      commentObject.mode === "replying" &&
      commentObject.comment._id === comment._id
    ) {
      return setCommentObject(null);
    }

    const parent = comments.filter((val) => {
      return val._id === comment._id;
    });
    //setting the comment object to reply mode and filling in parent field;
    setCommentObject({
      mode: "replying",
      comment: comment,
      parentId: comment._id,
    });
  };

  return (
    <HStack {...rest} justifyContent={"space-between"}>
      <div>
        <Button
          variant="outline"
          rounded="full"
          _focus={{ outline: "none" }}
          colorScheme={
            commentObject &&
            commentObject.mode === "replying" &&
            commentObject.comment._id === comment._id
              ? "pink"
              : "blackAlpha"
          }
          size={"sm"}
          leftIcon={
            commentObject &&
            commentObject.mode === "replying" &&
            commentObject.comment._id === comment._id ? (
              <MdOutlineCancel />
            ) : (
              <AiOutlineComment />
            )
          }
          onClick={() => replyButtonHandler(comment)}
        >
          {commentObject &&
          commentObject.mode === "replying" &&
          commentObject.comment._id === comment._id
            ? "Discard"
            : "reply"}
        </Button>
        {toggleRepliesButton}
      </div>
      <Stack direction={"row"}>
        <Button
          variant="outline"
          rounded="full"
          _focus={{ outline: "none" }}
          colorScheme="blackAlpha"
          size={"sm"}
          rightIcon={<AiOutlineLike />}
        >
          {comment.likes}
        </Button>
        <IconButton
          variant="outline"
          aria-label="dislike comment"
          rounded="full"
          _focus={{ outline: "none" }}
          colorScheme="blackAlpha"
          size={"sm"}
          icon={<AiOutlineDislike />}
        />
      </Stack>
    </HStack>
  );
};

export default memo(CommentList);
