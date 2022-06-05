import React from "react";

const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{comment.status == "approved" ? comment.content : comment.status}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
