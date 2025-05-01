interface Props {
  replyTo?: number;
}

export default function PostActions({ replyTo }: Props) {
  return (
    <div className="flex flex-col">
      {replyTo && <div></div>}
      <div></div>
    </div>
  );
}
