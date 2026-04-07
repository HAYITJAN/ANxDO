type UnderlineProps = {
  variant?: "underline";
  accent: string;
  rest?: string;
};

type BarProps = {
  variant: "bar";
  title: string;
};

type Props = UnderlineProps | BarProps;

/**
 * underline — birinchi so‘z ostida binafsha → pushti gradient chiziq (Trending Now, Asian Dramas, …)
 * bar — chapda vertikal gradient chiziq + butun sarlavha (Continue Watching)
 */
export function SectionHeading(props: Props) {
  if (props.variant === "bar") {
    return (
      <h2 className="mb-3 flex items-center gap-3.5 text-2xl font-bold tracking-tight text-violet-100 sm:text-3xl">
        <span
          className="h-9 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-fuchsia-500 via-purple-500 to-pink-500 shadow-[0_0_14px_rgba(168,85,247,0.45)]"
          aria-hidden
        />
        <span>{props.title}</span>
      </h2>
    );
  }

  const { accent, rest } = props;
  return (
    <h2 className="mb-3 text-2xl font-bold tracking-tight text-violet-100 sm:text-3xl">
      <span className="relative inline-block">
        <span className="relative z-10 text-violet-100">{accent}</span>
        <span
          className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500"
          aria-hidden
        />
      </span>
      {rest ? <span className="text-violet-100"> {rest}</span> : null}
    </h2>
  );
}
