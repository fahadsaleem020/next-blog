import { ArticleDoc, Comments } from "@models/index";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import parse, { HTMLReactParserOptions } from "html-react-parser";
import Image from "next/image";
import { Box, Container } from "@chakra-ui/react";
import styles from "../../styles/post.module.css";
import { connectToDatabase, dbName } from "@config/client.config";
import { findOperation, Resolver } from "@utils/index";
import { Collection, Document } from "mongodb";
import { MergeId } from "@Types/api";
import { fetcher, useComments } from "@withSWR/allComments";
import CommentList from "@components/comment/commentList";
import EmojiProvider, { useEmoji } from "@components/emojiProvider";
import RepliesProvider from "@components/RepliesProvider";
import { FC, useCallback, useState } from "react";
import { commmentUploadFunction } from "@components/comment/commentFormControls";
import { useUser } from "@components/stores";
import CommentBox from "@components/comment/commentBox";
import { v4 as uuid } from "uuid";

const PostPage: NextPage<{ article: Required<MergeId<ArticleDoc>> }> = ({
  article,
}) => {
  const options: HTMLReactParserOptions = {
    trim: true,
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.name === "img") {
        return (
          <Box rounded="xl" overflow={"hidden"}>
            <Image
              alt="no preview"
              src={domNode.attribs.src}
              layout="responsive"
              objectFit="cover"
              width={350}
              height={150}
              placeholder="blur"
              blurDataURL={domNode.attribs.src}
            />
          </Box>
        );
      }
    },
  };
  const articleBody = parse(article.body, options);
  const { data, isLoading, isValidating } = useComments(
    `/api/comments?postId=${article._id}`
  );

  return (
    <Container maxW="container.lg" className={styles.container}>
      {articleBody}
      <EmojiProvider>
        <PostWrapper article={article} data={data} />
      </EmojiProvider>
    </Container>
  );
};

const PostWrapper: FC<{
  data:
    | {
        comments: Comments[];
      }
    | undefined;

  article: Required<MergeId<ArticleDoc>>;
}> = ({ data, article }) => {
  const { mutate } = useComments(`/api/comments?postId=${article._id}`);
  const user = useUser(useCallback((state) => state.user, []));
  const [, , commentValue, setCommentValue] = useEmoji()!;
  const [isSubmitting, setIsSubmitting] = useState(false);

  //comment post handler;
  const postCommentHandler = async () => {
    setIsSubmitting(true);

    const comment: Comments = {
      body: commentValue!,
      by: user!.username,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      postId: article._id,
      identity: uuid(),
      isRoot: true,
      photo: user!.photo ?? "",
    };
    if (!comment.body || !(comment.body.trim().length >= 5)) {
      alert("Atleast 5 characters long!");
      return setIsSubmitting(false);
    }

    //comment sorter by date;
    const sortByUpdatedAt = (a: Comments, b: Comments) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    };

    setTimeout(() => {
      //update comment list locally;
      const castedComment = comment as Comments & { _id: string };
      data!.comments.push(castedComment);
      data!.comments.sort((a, b) => b.likes - a.likes);
      const updatedComment = { comments: data!.comments };
      updatedComment.comments.sort(sortByUpdatedAt);
      mutate(updatedComment, false);
    }, 50);

    const { status, statusCode } = await commmentUploadFunction(comment);
    if (status && statusCode === 200) {
      setIsSubmitting(false);
      mutate(fetcher(`/api/comments?postId=${article._id}`), false);
    } else {
      alert("failed to post comment!");
      setIsSubmitting(false);
    }
  };

  return (
    <RepliesProvider>
      <CommentBox
        article={article}
        mt={5}
        uploadState={[isSubmitting, setIsSubmitting]}
        uploadHandler={postCommentHandler}
      />
      {data && data.comments ? (
        <CommentList comments={data!.comments as any} article={article} />
      ) : (
        "no comments"
      )}
    </RepliesProvider>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const articles = await (
    await await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
  ).toArray();

  const paths = articles.map((val) => ({
    params: { id: [val._id.toString(), val.slug] },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //from parameters
  const articleId = (params as any).id[0];
  const articleSlug = (params as any).id[1];

  // client instance
  const { client, db } = await Resolver(connectToDatabase());

  //articles collection;
  const ArticleCollection: Collection<Document> = client
    .db(dbName)
    .collection("articles");

  //getting all articles
  const article = (
    await (
      await await Resolver(findOperation<ArticleDoc>(ArticleCollection, {}))
    ).toArray()
  )
    .filter((val) => val._id.toString() === decodeURIComponent(articleId))
    .map((val) => ({
      ...val,
      _id: val._id.toString(),
      createdAt: val.createdAt.toISOString(),
      updatedAt: val.updatedAt.toISOString(),
    }))[0];

  return {
    props: { article },
    revalidate: 10,
  };
};

export default PostPage;
