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
 * underline — birinchi so‘z ostida tekis accent chiziq
 * bar — chapda vertikal accent chiziq + butun sarlavha
 */
export function SectionHeading(props: Props) {
  if (props.variant === "bar") {
    return (
      <h2 className="mb-3 flex items-center gap-3.5 text-2xl font-bold tracking-tight text-violet-100 sm:text-3xl">
        <span
          className="h-9 w-[3px] shrink-0 rounded-full bg-accent shadow-[0_0_14px_rgba(124,58,237,0.45)]"
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
          className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-accent"
          aria-hidden
        />
      </span>
      {rest ? <span className="text-violet-100"> {rest}</span> : null}
    </h2>
  );
}
