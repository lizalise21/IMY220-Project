// Displays all comments left on a post.
export default function Comments({ comments }) {
  return (
    <div className="comments">
      <h2 className="section-title">Comments</h2>
      {comments.length ? (
        comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <img className="avatar sm" src={comment.author.avatar} alt={comment.author.displayName} />
            <p className="text">
              <span className="name">{comment.author.displayName}</span>
              {comment.text}
            </p>
          </div>
        ))
      ) : (
        <p className="empty-state">No comments yet. Be the first!</p>
      )}
    </div>
  );
}
