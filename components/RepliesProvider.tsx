import { Replies, Comments } from "@models/index";
import { createContext, Dispatch, FC, SetStateAction, useState } from "react";

type CommentsWithId = Comments & { _id: string };

export const RepliesContext = createContext<
  | [
      (
        | []
        | {
            nestedComments: (Replies & CommentsWithId)[];
            comment: Replies & CommentsWithId;
          }[]
      ),
      Dispatch<
        SetStateAction<
          | []
          | {
              nestedComments: (Replies & CommentsWithId)[];
              comment: Replies & CommentsWithId;
            }[]
        >
      >
    ]
  | []
>([]);

const RepliesProvider: FC = ({ children }) => {
  const [replyObject, setReplyObject] = useState<
    | {
        nestedComments: (Replies & CommentsWithId)[];
        comment: Replies & CommentsWithId;
      }[]
    | []
  >([]);

  return (
    <RepliesContext.Provider value={[replyObject, setReplyObject]}>
      {children}
    </RepliesContext.Provider>
  );
};

export default RepliesProvider;
