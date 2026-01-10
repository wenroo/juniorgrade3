export default [
  // Flex
  // Flex Wrap/Direction
  {
    pattern: /flex-(wrap|row|col|none|initial|row-reverse|col-reverse)/,
    variants:['sm','md','lg','xl','2xl'] 
  },
  // Flex Shrink
  'shrink-0',
  // Flex Gap
  'gap-0','gap-2','gap-4','gap-6','gap-8','gap-10','gap-12','gap-16','gap-20','gap-24',
  'sm:gap-0','sm:gap-2','sm:gap-4','sm:gap-6','sm:gap-8','sm:gap-10','sm:gap-12','sm:gap-16','sm:gap-20','sm:gap-24',
  'md:gap-0','md:gap-2','md:gap-4','md:gap-6','md:gap-8','md:gap-10','md:gap-12','md:gap-16','md:gap-20','md:gap-24',
  'lg:gap-0','lg:gap-2','lg:gap-4','lg:gap-6','lg:gap-8','lg:gap-10','lg:gap-12','lg:gap-16','lg:gap-20','lg:gap-24',
  'xl:gap-0','xl:gap-2','xl:gap-4','xl:gap-6','xl:gap-8','xl:gap-10','xl:gap-12','xl:gap-16','xl:gap-20','xl:gap-24',
  '2xl:gap-0','2xl:gap-2','2xl:gap-4','2xl:gap-6','2xl:gap-8','2xl:gap-10','2xl:gap-12','2xl:gap-16','2xl:gap-20','2xl:gap-24',
  // Grid
  'grid-flow-col',
  'grid-cols-none','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-5','grid-cols-10','grid-cols-12',
  'sm:grid-cols-none','sm:grid-cols-2','sm:grid-cols-3','sm:grid-cols-4','sm:grid-cols-5',
  'md:grid-cols-none','md:grid-cols-2','md:grid-cols-3','md:grid-cols-4','md:grid-cols-5',
  // Grid Start/End
  {
    pattern: /col-(start|end)-(1|2|3|4|5|6|7|8|9|10|11|12)/,
    variants:['sm','md','lg','xl'] 
  },
  // Flex Justify
  'justify-stretch','justify-start','justify-center','justify-end',  
  'self-start', 'self-end', 'self-center', 'self-stretch',
  'items-start','items-end','items-center','items-stretch',
  // Grid Place Content
  'place-self-start', 'place-self-end', 'place-self-center', 'place-self-stretch', 
  'justify-items-start', 'justify-items-end', 'justify-items-center', 'justify-items-stretch',
  'place-content-center', 'place-content-between', 'place-content-around','place-content-stretch',
  'place-items-start','place-items-end','place-items-center','place-items-stretch',
  // Grid Align Content
  'content-center', 'content-start', 'content-end', 'content-stretch',
  // Grid Template Columns
  'col-span-full',
  {
    pattern: /col-span-(1|2|3|4|5|6|7|8|9|10|11|12)/,
    variants :['sm','md','lg','xl','2xl'] 
  },
  // Spacing
  // Spacing Margin / Padding
  'mx-auto',
  '-my-5', '-my-10',
  'm-0','m-0.5','m-1','m-2','m-3','m-4','m-5','m-6','m-7','m-8','m-9','m-10',
  'p-0','p-0.5','p-1','p-2','p-3','p-4','p-5','p-6','p-7','p-8','p-9','p-10',
  'mx-0','mx-0.5','mx-1','mx-2','mx-3','mx-4','mx-5','mx-6','mx-7','mx-8','mx-9','mx-10',
  'my-0','my-0.5','my-1','my-2','my-3','my-4','my-5','my-6','my-7','my-8','my-9','my-10',
  'px-0','px-0.5','px-1','px-2','px-3','px-4','px-5','px-6','px-7','px-8','px-9','px-10',
  'py-0','py-0.5','py-1','py-2','py-3','py-4','py-5','py-6','py-7','py-8','py-9','py-10',
  'sm:m-0','sm:p-0','sm:mx-0','sm:px-0','sm:my-0','sm:py-0',
  'md:m-0','md:p-0','md:mx-0','md:px-0','md:my-0','md:py-0',
  'mt-0','mt-px','mt-0.5','mt-1','mt-2','mt-3','mt-4','mt-5','mt-6','mt-7','mt-8','mt-9','mt-10',
  'pt-0','pt-0.5','pt-1','pt-2','pt-3','pt-4','pt-5','pt-6','pt-7','pt-8','pt-9','pt-10',
  'mr-0','mr-px','mr-0.5','mr-1','mr-2','mr-3','mr-4','mr-5','mr-6','mr-7','mr-8','mr-9','mr-10',
  'pr-0','pr-0.5','pr-1','pr-2','pr-3','pr-4','pr-5','pr-6','pr-7','pr-8','pr-9','pr-10',
  'mb-0','mb-px','mb-0.5','mb-1','mb-2','mb-3','mb-4','mb-5','mb-6','mb-7','mb-8','mb-9','mb-10',
  'pb-0','pb-0.5','pb-1','pb-2','pb-3','pb-4','pb-5','pb-6','pb-7','pb-8','pb-9','pb-10',
  'ml-0','ml-px','ml-0.5','ml-1','ml-2','ml-3','ml-4','ml-5','ml-6','ml-7','ml-8','ml-9','ml-10',
  'pl-0','pl-0.5','pl-1','pl-2','pl-3','pl-4','pl-5','pl-6','pl-7','pl-8','pl-9','pl-10',
  'sm:mt-0','sm:mt-0.5','sm:mt-1','sm:mt-2','sm:mt-3','sm:mt-4','sm:mt-5','sm:mt-6','sm:mt-7','sm:mt-8','sm:mt-9','sm:mt-10',
  'sm:pt-0','sm:pt-0.5','sm:pt-1','sm:pt-2','sm:pt-3','sm:pt-4','sm:pt-5','sm:pt-6','sm:pt-7','sm:pt-8','sm:pt-9','sm:pt-10',
  'sm:mr-0','sm:mr-0.5','sm:mr-1','sm:mr-2','sm:mr-3','sm:mr-4','sm:mr-5','sm:mr-6','sm:mr-7','sm:mr-8','sm:mr-9','sm:mr-10',
  'sm:pr-0','sm:pr-0.5','sm:pr-1','sm:pr-2','sm:pr-3','sm:pr-4','sm:pr-5','sm:pr-6','sm:pr-7','sm:pr-8','sm:pr-9','sm:pr-10',
  'sm:mb-0','sm:mb-0.5','sm:mb-1','sm:mb-2','sm:mb-3','sm:mb-4','sm:mb-5','sm:mb-6','sm:mb-7','sm:mb-8','sm:mb-9','sm:mb-10',
  'sm:pb-0','sm:pb-0.5','sm:pb-1','sm:pb-2','sm:pb-3','sm:pb-4','sm:pb-5','sm:pb-6','sm:pb-7','sm:pb-8','sm:pb-9','sm:pb-10',
  'sm:ml-0','sm:ml-0.5','sm:ml-1','sm:ml-2','sm:ml-3','sm:ml-4','sm:ml-5','sm:ml-6','sm:ml-7','sm:ml-8','sm:ml-9','sm:ml-10',
  'sm:pl-0','sm:pl-0.5','sm:pl-1','sm:pl-2','sm:pl-3','sm:pl-4','sm:pl-5','sm:pl-6','sm:pl-7','sm:pl-8','sm:pl-9','sm:pl-10',
  'md:mt-0','md:mt-0.5','md:mt-1','md:mt-2','md:mt-3','md:mt-4','md:mt-5','md:mt-6','md:mt-7','md:mt-8','md:mt-9','md:mt-10',
  'md:pt-0','md:pt-0.5','md:pt-1','md:pt-2','md:pt-3','md:pt-4','md:pt-5','md:pt-6','md:pt-7','md:pt-8','md:pt-9','md:pt-10',
  'md:mr-0','md:mr-0.5','md:mr-1','md:mr-2','md:mr-3','md:mr-4','md:mr-5','md:mr-6','md:mr-7','md:mr-8','md:mr-9','md:mr-10',
  'md:pr-0','md:pr-0.5','md:pr-1','md:pr-2','md:pr-3','md:pr-4','md:pr-5','md:pr-6','md:pr-7','md:pr-8','md:pr-9','md:pr-10',
  'md:mb-0','md:mb-0.5','md:mb-1','md:mb-2','md:mb-3','md:mb-4','md:mb-5','md:mb-6','md:mb-7','md:mb-8','md:mb-9','md:mb-10',
  'md:pb-0','md:pb-0.5','md:pb-1','md:pb-2','md:pb-3','md:pb-4','md:pb-5','md:pb-6','md:pb-7','md:pb-8','md:pb-9','md:pb-10',
  'md:ml-0','md:ml-0.5','md:ml-1','md:ml-2','md:ml-3','md:ml-4','md:ml-5','md:ml-6','md:ml-7','md:ml-8','md:ml-9','md:ml-10',
  'md:pl-0','md:pl-0.5','md:pl-1','md:pl-2','md:pl-3','md:pl-4','md:pl-5','md:pl-6','md:pl-7','md:pl-8','md:pl-9','md:pl-10',
  'mt-16','pt-16','mr-16','pr-16','mb-16','pb-16','ml-16','pl-16',
  'sm:mt-16','sm:pt-16','sm:mr-16','sm:pr-16','sm:mb-16','sm:pb-16','sm:ml-16','sm:pl-16',
  'md:mt-16','md:pt-16','md:mr-16','md:pr-16','md:mb-16','md:pb-16','md:ml-16','md:pl-16',
  'mt-28','pt-28','mr-28','pr-28','mb-28','pb-28','ml-28','pl-28',
  'sm:mt-28','sm:pt-28','sm:mr-28','sm:pr-28','sm:mb-28','sm:pb-28','sm:ml-28','sm:pl-28',
  'md:mt-28','md:pt-28','md:mr-28','md:pr-28','md:mb-28','md:pb-28','md:ml-28','md:pl-28',
  '-mt-px','-mt-0.5','-mt-1','-mt-2','-mt-3','-mt-4','-mt-5',
  'sm:-mt-px','sm:-mt-0.5','sm:-mt-1','sm:-mt-2','sm:-mt-3','sm:-mt-4','sm:-mt-5',
  'md:-mt-px','md:-mt-0.5','md:-mt-1','md:-mt-2','md:-mt-3','md:-mt-4','md:-mt-5',
  '-mb-px','-mb-0.5','-mb-1','-mb-2','-mb-3','-mb-4','-mb-5',
  'sm:-mb-px','sm:-mb-0.5','sm:-mb-1','sm:-mb-2','sm:-mb-3','sm:-mb-4','sm:-mb-5',
  'md:-mb-px','md:-mb-0.5','md:-mb-1','md:-mb-2','md:-mb-3','md:-mb-4','md:-mb-5',
  '-ml-px','-ml-0.5','-ml-1','-ml-2','-ml-3','-ml-4','-ml-5',
  'sm:-ml-px','sm:-ml-0.5','sm:-ml-1','sm:-ml-2','sm:-ml-3','sm:-ml-4','sm:-ml-5',
  'md:-ml-px','md:-ml-0.5','md:-ml-1','md:-ml-2','md:-ml-3','md:-ml-4','md:-ml-5',
  '-mr-px','-mr-0.5','-mr-1','-mr-2','-mr-3','-mr-4','-mr-5','-mr-6',
  'sm:-mr-px','sm:-mr-0.5','sm:-mr-1','sm:-mr-2','sm:-mr-3','sm:-mr-4','sm:-mr-5',
  'md:-mr-px','md:-mr-0.5','md:-mr-1','md:-mr-2','md:-mr-3','md:-mr-4','md:-mr-5',
  // Spacing Overlap
  {
    pattern: /overlap-(l|r)-(10|20)/,
    variants :['sm','md'] 
  },
  // Spacing Space
  '-space-x-10','sm:-space-x-10','md:-space-x-10','lg:-space-x-10','xl:-space-x-10',
  '-space-x-20','sm:-space-x-20','md:-space-x-20','lg:-space-x-20','xl:-space-x-20',
  '-space-y-10','sm:-space-y-10','md:-space-y-10','lg:-space-y-10','xl:-space-y-10',
  '-space-y-20','sm:-space-y-20','md:-space-y-20','lg:-space-y-20','xl:-space-y-20',
  // Layout Aspect Ratio
  'aspect-1-1','aspect-4-3','aspect-5-4','aspect-16-9','aspect-9-16',
  // Layout Box Size
  'box-border','box-content',	
  // Layout Display
  'flow-root',
  '!block','!hidden',
  {
    pattern: /(hidden|block|inline-block|flex|inline-flex|grid|inline-grid)/,
    variants :['sm','md','lg','xl'] 
  },
  // Layout Float
  {
    pattern: /(float-(left|right))/,
    variants :['sm','md','lg'] 
  },
  'clear-both',
  // Layout Object
  'object-contain','object-cover','object-none','object-fill',
  'object-bottom', 'object-center', 'object-left', 'object-left-bottom', 'object-left-top', 'object-right', 'object-right-bottom', 'object-right-top', 'object-top',
  // Layout Overflow
  'overflow-hidden','overflow-x-hidden','overflow-y-hidden',
  'overflow-auto','overflow-x-auto','overflow-y-auto',
  'overflow-scroll','overflow-x-scroll','overflow-y-scroll',
  'overflow-visible','!overflow-visible',
  // Layout Position
  'static', 'absolute', 'relative','fixed','sticky',
  'sm:static', 'sm:absolute', 'sm:relative','sm:fixed','sm:sticky',
  'md:static', 'md:absolute', 'md:relative','md:fixed','md:sticky',
  // Layout Z-Index
  'z-0','z-10','z-20','z-40','z-50',
  // Layout Top/Bottom
  'top-0','bottom-0','left-0','right-0',
  'sm:top-0','sm:bottom-0','sm:left-0','sm:right-0',
  'md:top-0','md:bottom-0','md:left-0','md:right-0',
  'top-full','bottom-full','left-full','right-full',
  'top-12-1','top-12-2','top-12-3','top-12-4','top-12-5','top-12-6',
  'md:top-12-1','md:top-12-2','md:top-12-3','md:top-12-4','md:top-12-5','md:top-12-6',
  'bottom-12-1','bottom-12-2','bottom-12-3','bottom-12-4','bottom-12-5','bottom-12-6',
  'md:bottom-12-1','md:bottom-12-2','md:bottom-12-3','md:bottom-12-4','md:bottom-12-5','md:bottom-12-6',
  'left-12-1','left-12-2','left-12-3','left-12-4','left-12-5','left-12-6',
  'right-12-1','right-12-2','right-12-3','right-12-4','right-12-5','right-12-6',
  'md:left-12-1','md:left-12-2','md:left-12-3','md:left-12-4','md:left-12-5','md:left-12-6',
  'md:right-12-1','md:right-12-2','md:right-12-3','md:right-12-4','md:right-12-5','md:right-12-6',
  'inset-x-0', 'inset-y-0',	'inset-0',
  'inset-x-1/2', 'inset-y-1/2',	'inset-1/2',
  // Layout Visible
  'invisible','visible',
  // Effects
  // Effects Opacity
  'opacity-0','opacity-10','opacity-20','opacity-30','opacity-40','opacity-50',
  'opacity-60','opacity-70','opacity-80','opacity-90','opacity-100',
  // Effects Shadow
  'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-inner','shadow-inner-bottom',
  'hover:shadow', 'hover:shadow-sm', 'hover:shadow-md', 'hover:shadow-lg', 'hover:shadow-inner','hover:shadow-inner-bottom',
  'shadow-none','hover:shadow-none','!shadow-none',
  // Typography
  // Typography Font Family 
  'font-sans', 'font-serif', 'font-body',
  // Typography Font Weight 
  'font-bold','font-medium','font-normal',
  // Typography Font style 
  'italic',
  // Typography Transform
  'uppercase','lowercase','capitalize',
  // Typography Line Height
  'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
  // Typography Font Size
  'text-0','text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl','text-4xl', 'text-5xl', 'text-6xl',
  'sm:text-0','sm:text-xs', 'sm:text-sm', 'sm:text-base', 'sm:text-lg', 'sm:text-xl', 'sm:text-2xl', 'sm:text-3xl','sm:text-4xl', 'sm:text-5xl', 'sm:text-6xl',
  'md:text-0','md:text-xs', 'md:text-sm', 'md:text-base', 'md:text-lg', 'md:text-xl', 'md:text-2xl', 'md:text-3xl','md:text-4xl', 'md:text-5xl', 'md:text-6xl',
  'lg:text-0','lg:text-xs', 'lg:text-sm', 'lg:text-base', 'lg:text-lg', 'lg:text-xl', 'lg:text-2xl', 'lg:text-3xl','lg:text-4xl', 'lg:text-5xl', 'lg:text-6xl',
  // Typography Text Align
  'text-left', 'text-center', 'text-right', 'text-justify',
  // Typography Text Decoration
  'underline', 'overline', 'line-through', 'no-underline',
  // Typography Text Whitespace
  'whitespace-nowrap', 'whitespace-normal',
  // Typography Text Wordbreak
  'break-words','break-all',
  // Typography Line Clamp
  'line-clamp-none','sm:line-clamp-none','md:line-clamp-none','lg:line-clamp-none','xl:line-clamp-none',
  {
    pattern: /line-clamp-(1|2|3|4|5|6|7|8|9)/,
    variants :['sm','md','lg']  

  },
  // Typography List
  'list-disc', 'list-none', 'list-decimal', 
  'list-inside', 'list-outside',
  // Background
  'bg-fixed', 'bg-local', 'bg-scroll',
  'bg-clip-text',
  'bg-no-repeat','bg-repeat-x','bg-repeat-y',
  'bg-cover','bg-contain',
  'bg-bottom', 'bg-center', 'bg-left', 'bg-right', 'bg-top', 
  'bg-left-bottom', 'bg-left-top', 'bg-right-bottom', 'bg-right-top',
  // Sizing
  // Sizing Width / Height
  {
    pattern: /(w|h)-(full|screen|fit)/,
    variants :['sm','md','lg','xl'] 
  },
  'w-1/12','w-2/12','w-3/12','w-4/12','w-5/12','w-6/12','w-7/12','w-8/12','w-9/12','w-10/12','w-11/12',
  'sm:w-1/12','sm:w-2/12','sm:w-3/12','sm:w-4/12','sm:w-5/12','sm:w-6/12','sm:w-7/12','sm:w-8/12','sm:w-9/12','sm:w-10/12','sm:w-11/12',
  'md:w-1/12','md:w-2/12','md:w-3/12','md:w-4/12','md:w-5/12','md:w-6/12','md:w-7/12','md:w-8/12','md:w-9/12','md:w-10/12','md:w-11/12',
  'lg:w-1/12','lg:w-2/12','lg:w-3/12','lg:w-4/12','lg:w-5/12','lg:w-6/12','lg:w-7/12','lg:w-8/12','lg:w-9/12','lg:w-10/12','lg:w-11/12',
  'w-1/5','w-2/5','w-3/5','w-4/5',
  'sm:w-1/5','sm:w-2/5','sm:w-3/5','sm:w-4/5',
  'md:w-1/5','md:w-2/5','md:w-3/5','md:w-4/5',
  'lg:w-1/5','lg:w-2/5','lg:w-3/5','lg:w-4/5',
  'w-1','w-2','w-3','w-4','w-5','w-6','w-7','w-8','w-9','w-12','w-14','w-16','w-20','w-24','w-28','w-32','w-36','w-40',
  'sm:w-1','sm:w-2','sm:w-3','sm:w-4','sm:w-5','sm:w-6','sm:w-7','sm:w-8','sm:w-9','sm:w-12','sm:w-14','sm:w-16','sm:w-20','sm:w-24','sm:w-28','sm:w-32','sm:w-36','sm:w-40',
  'md:w-1','md:w-2','md:w-3','md:w-4','md:w-5','md:w-6','md:w-7','md:w-8','md:w-9','md:w-12','md:w-14','md:w-16','md:w-20','md:w-24','md:w-28','md:w-32','md:w-36','md:w-40',
  'lg:w-1','lg:w-2','lg:w-3','lg:w-4','lg:w-5','lg:w-6','lg:w-7','lg:w-8','lg:w-9','lg:w-12','lg:w-14','lg:w-16','lg:w-20','lg:w-24','lg:w-28','lg:w-32','lg:w-36','lg:w-40',
  'h-0','h-1','h-2','h-3','h-4','h-5','h-6','h-7','h-8','h-9','h-12','h-14','h-16','h-20','h-24','h-28','h-32','h-36','h-40',
  'sm:h-0','sm:h-1','sm:h-2','sm:h-3','sm:h-4','sm:h-5','sm:h-6','sm:h-7','sm:h-8','sm:h-9','sm:h-12','sm:h-14','sm:h-16','sm:h-20','sm:h-24','sm:h-28','sm:h-32','sm:h-36','sm:h-40',
  'md:h-0','md:h-1','md:h-2','md:h-3','md:h-4','md:h-5','md:h-6','md:h-7','md:h-8','md:h-9','md:h-12','md:h-14','md:h-16','md:h-20','md:h-24','md:h-28','md:h-32','md:h-36','md:h-40',
  'lg:h-0','lg:h-1','lg:h-2','lg:h-3','lg:h-4','lg:h-5','lg:h-6','lg:h-7','lg:h-8','lg:h-9','lg:h-12','lg:h-14','lg:h-16','lg:h-20','lg:h-24','lg:h-28','lg:h-32','lg:h-36','lg:h-40',
  // Sizing Min/Max Witdh/Height
  'max-w-12-1','max-w-12-2','max-w-12-3','max-w-12-4','max-w-12-5','max-w-12-6','max-w-12-7','max-w-12-8','max-w-12-9','max-w-12-10','max-w-12-11',
  'max-h-12-1','max-h-12-2','max-h-12-3','max-h-12-4','max-h-12-5','max-h-12-6','max-h-12-7','max-h-12-8','max-h-12-9','max-h-12-10','max-h-12-11',
  'max-w-full','max-w-fit','sm:max-w-full','sm:max-w-fit','md:max-w-full','md:max-w-fit','lg:max-w-full','lg:max-w-fit',
  'max-w-screen-sm','max-w-screen-md','max-w-screen-lg','max-w-screen-xl','max-w-screen-2xl',
  'min-h-4','min-h-8','min-h-16','min-h-32','min-h-36',
  'min-h-0','min-h-full','min-h-screen','min-h-fit',
  'sm:min-h-0','sm:min-h-full','sm:min-h-screen','sm:min-h-fit',
  'md:min-h-0','md:min-h-full','md:min-h-screen','md:min-h-fit',
  'lg:min-h-0','lg:min-h-full','lg:min-h-screen','lg:min-h-fit',
  'max-h-full','max-h-screen','max-h-fit','max-h-96',
  'sm:max-h-full','sm:max-h-screen','sm:max-h-fit','sm:max-h-96',
  'md:max-h-full','md:max-h-screen','md:max-h-fit','md:max-h-96',
  'lg:max-h-full','lg:max-h-screen','lg:max-h-fit','lg:max-h-96',
  // Borders
  // Borders Style
  'border-none', 'border-solid', 'border-dashed', 'border-dotted', 'border-double',
  // Border Width
  'border', 'border-2', 'border-4', 
  'border-b', 'border-b-2', 'border-b-4', 
  'border-t', 'border-t-2', 'border-t-4', 
  'border-l', 'border-l-2', 'border-l-4', 
  'border-r', 'border-r-2', 'border-r-4',
  'sm:border-b','md:border-b','lg:border-b',
  'sm:border-t','md:border-t','lg:border-t',
  'sm:border-l','md:border-l','lg:border-l',
  'sm:border-r','md:border-r','lg:border-r',
  // Borders Divide 
  'divide-inherit', 'divide-transparent',
  'sm:divide-inherit', 'sm:divide-transparent',
  'md:divide-inherit', 'md:divide-transparent',
  'divide-solid','divide-dashed',
  'divide-x-0', 'divide-x-2', 'divide-x-4', 'divide-x', 'divide-y', 'divide-y-0', 'divide-y-2', 'divide-y-4',
  // Borders Rounded
  'rounded',
  'rounded-br','rounded-bl','rounded-tr','rounded-tl',
  {
    pattern: /rounded-(none|sm|md|lg|xl|full)/,
    variants :[]
  },
  'sm:rounded-none','md:rounded-none',
  {
    pattern: /rounded-(br|bl|tr|tl)-(none|sm|md|lg|xl|full)/,
    variants :[]
  },
  {
    pattern: /rounded-(t|b|l|r)-none/,
    variants :['sm','md'] 
  },
  // Outline Style
  'outline-none', 'hover:outline-none',
  // Filter
  // Filter Drop Shadow
  'drop-shadow-sm','drop-shadow','drop-shadow-md','drop-shadow-lg','drop-shadow-xl','drop-shadow-2xl',
  'drop-shadow-none','!drop-shadow-none',
  // Filter Grayscale
  'grayscale','backdrop-grayscale',
  'blur-none', 'blur-sm', 'blur', 'blur-md', 'blur-lg', 'blur-xl',
  // Filter Backdrop Grayscale/Blur
  'backdrop-blur-sm', 'backdrop-blur', 'backdrop-blur-md', 'backdrop-blur-lg', 'backdrop-blur-xl',
  // Transforms
  // Transforms Translate
  'translate-x-0', 'translate-y-0', 'translate-y-1/2', 'translate-x-1/2','-translate-y-1/2', '-translate-x-1/2',
  // Transforms Rotate
  'rotate-45','rotate-90','rotate-180','rotate-270',
  // Transforms animate
  'animate-pulse-once',
  'animate-spin', 'animate-ping', 'animate-pulse','animate-bounce',
  'hover:animate-spin', 'hover:animate-ping', 'hover:animate-pulse','hover:animate-bounce',
  // Interactivity
  // Interactivity Cursor
  'cursor-pointer','cursor-default','cursor-wait','cursor-move','cursor-help','cursor-not-allowed','cursor-copy',
  'cursor-no-drop','cursor-grab','cursor-grabbing','cursor-col-resize','cursor-row-resize',
  '!cursor-default',
  // Resize
  'pointer-events-none','pointer-events-auto',
  'resize-none','resize-y','resize-x','resize',
  // Select
  'select-none', 'select-text', 'select-all',
  // Will Change,
  'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',
  // Colors
  // Colors Text
  'text-white','text-black','text-transparent',
  'text-primary','text-secondary','text-tertiary',
  'text-text-primary','text-text-secondary','text-text-tertiary',
  'text-text-highlight','text-text-lightbg-1st','text-text-lightbg-2nd',
  'text-text-highlight-mediumbg','text-text-mediumbg-1st',
  'text-text-mediumbg-2nd','text-text-highlight-darkbg',
  'text-text-darkbg-1st','text-text-darkbg-2nd',
  'text-hyperlink','text-hyperlink-hover',
  'text-hyperlink-mediumbg','text-hyperlink-mediumbg-hover',
  'text-hyperlink-darkbg','text-hyperlink-darkbg-hover',
  'hover:text-text-primary','hover:text-text-secondary','hover:text-text-tertiary',
  'hover:text-text-highlight','hover:text-text-lightbg-1st','hover:text-text-lightbg-2nd',
  'hover:text-text-highlight-mediumbg','hover:text-text-mediumbg-1st',
  'hover:text-text-mediumbg-2nd','hover:text-text-highlight-darkbg',
  'hover:text-text-darkbg-1st','hover:text-text-darkbg-2nd',
  'hover:text-hyperlink','hover:text-hyperlink-hover',
  'hover:text-hyperlink-mediumbg','hover:text-hyperlink-mediumbg-hover',
  'hover:text-hyperlink-darkbg','hover:text-hyperlink-darkbg-hover',
  '!text-text-primary','!text-text-secondary','!text-text-tertiary',
  '!text-text-highlight','!text-text-lightbg-1st','!text-text-lightbg-2nd',
  '!text-text-highlight-mediumbg','!text-text-mediumbg-1st',
  '!text-text-mediumbg-2nd','!text-text-highlight-darkbg',
  '!text-text-darkbg-1st','!text-text-darkbg-2nd',
  '!text-hyperlink','!text-hyperlink-hover',
  '!text-hyperlink-mediumbg','!text-hyperlink-mediumbg-hover',
  '!text-hyperlink-darkbg','!text-hyperlink-darkbg-hover',
  // Colors Text System
  'text-neutral-white','text-neutral-clean','text-neutral-pale','text-neutral-light','text-neutral-medium','text-neutral-dark',
  'hover:text-neutral-white','hover:text-neutral-clean','hover:text-neutral-pale','hover:text-neutral-light','hover:text-neutral-medium','hover:text-neutral-dark',
  // Colors Background System
  'bg-black','bg-black/10','bg-black/25','bg-black/50','bg-black/75','bg-black/90',
  // Colors Background Color
  'bg-semantic-red',
  'bg-primary','bg-secondary','bg-tertiary',
  'bg-lightbg','bg-darkbg','bg-mediumbg','bg-whitebg','bg-highlightbg',
  'hover:bg-lightbg','hover:bg-darkbg','hover:bg-mediumbg','hover:bg-whitebg','hover:bg-highlightbg',
  '!bg-lightbg','!bg-darkbg','!bg-mediumbg','!bg-whitebg','!bg-highlightbg',
  // Colors Background Color Opacity
  'bg-lightbg/10','bg-darkbg/10','bg-mediumbg/10','bg-whitebg/10','bg-highlightbg/10',
  'bg-lightbg/25','bg-darkbg/25','bg-mediumbg/25','bg-whitebg/25','bg-highlightbg/25',
  'bg-lightbg/50','bg-darkbg/50','bg-mediumbg/50','bg-whitebg/50','bg-highlightbg/50',
  'bg-lightbg/75','bg-darkbg/75','bg-mediumbg/75','bg-whitebg/75','bg-highlightbg/75',
  'bg-lightbg/90','bg-darkbg/90','bg-mediumbg/90','bg-whitebg/90','bg-highlightbg/90',
  // Colors Background Color From Text Color
  'bg-text-primary','bg-text-secondary','bg-text-tertiary',
  'bg-text-highlight','bg-text-lightbg-1st','bg-text-lightbg-2nd',
  'bg-text-highlight-mediumbg','bg-text-mediumbg-1st','bg-text-mediumbg-2nd',
  'bg-text-highlight-darkbg','bg-text-darkbg-1st','bg-text-darkbg-2nd',
  'bg-hyperlink','bg-hyperlink-hover',
  'bg-hyperlink-mediumbg','bg-hyperlink-medium-hover',
  'bg-hyperlink-darkbg','bg-hyperlink-darkbg-hover',
  // Colors Background Color From Border Color
  'bg-outline-clean','bg-outline-dark','bg-outline-light','bg-outline-medium','bg-outline-neutral',
  // Colors Border Color 
  'border-transparent','border-outline-clean','border-outline-dark','border-outline-light','border-outline-medium','border-outline-neutral',
  'hover:border-transparent','hover:border-outline-clean','hover:border-outline-dark','hover:border-outline-light','hover:border-outline-medium','hover:border-outline-neutral',
  '!border-transparent','!border-outline-clean','!border-outline-dark','!border-outline-light','!border-outline-medium','!border-outline-neutral',
  'border-r-transparent','border-r-outline-clean','border-r-outline-dark','border-r-outline-light','border-r-outline-medium','border-r-outline-neutral',
  'sm:border-r-transparent','sm:border-r-outline-clean','sm:border-r-outline-dark','sm:border-r-outline-light','sm:border-r-outline-medium','sm:border-r-outline-neutral',
  'md:border-r-transparent','md:border-r-outline-clean','md:border-r-outline-dark','md:border-r-outline-light','md:border-r-outline-medium','md:border-r-outline-neutral',
  'border-l-transparent','border-l-outline-clean','border-l-outline-dark','border-l-outline-light','border-l-outline-medium','border-l-outline-neutral',
  'sm:border-l-transparent','sm:border-l-outline-clean','sm:border-l-outline-dark','sm:border-l-outline-light','sm:border-l-outline-medium','sm:border-l-outline-neutral',
  'md:border-l-transparent','md:border-l-outline-clean','md:border-l-outline-dark','md:border-l-outline-light','md:border-l-outline-medium','md:border-l-outline-neutral',
  'border-t-transparent','border-t-outline-clean','border-t-outline-dark','border-t-outline-light','border-t-outline-medium','border-t-outline-neutral',
  'border-b-transparent','border-b-outline-clean','border-b-outline-dark','border-b-outline-light','border-b-outline-medium','border-b-outline-neutral',
  'hover:border-b-transparent','hover:border-b-outline-clean','hover:border-b-outline-dark','hover:border-b-outline-light','hover:border-b-outline-medium','hover:border-b-outline-neutral',
  // Color Disabled
  'border-neutral-pale','bg-neutral-pale','!bg-neutral-pale',
  // Custom
  // Custom Image Fill
  'bg-fill','sm:bg-fill','md:bg-fill','lg:bg-fill','xl:bg-fill',
  'bg-fill-clear','sm:bg-fill-clear','md:bg-fill-clear','lg:bg-fill-clear','xl:bg-fill-clear',
  // Custom Button
  'btn', 'btn-link',
  // Custom Tags
  'tag-1','tag-2','tag-3','tag-4','tag-5','tag-6','tag-7','tag-8','tag-9','tag-10','tag-11','tag-12',
  // System
  'sr-only','bg-neutral-clean'
]


