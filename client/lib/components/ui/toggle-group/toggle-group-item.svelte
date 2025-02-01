<script>
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";

	import { toggleVariants } from "$lib/components/ui/toggle/index.js";
	import { cn } from "$lib/utils.js";

	import { getToggleGroupCtx } from "./toggle-group.svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size,
		variant,
		...restProps
	} = $props();

	const ctx = getToggleGroupCtx();
</script>

<ToggleGroupPrimitive.Item
	bind:ref
	class={cn(
		toggleVariants({
			variant: ctx.variant || variant,
			size: ctx.size || size,
		}),
		className
	)}
	{value}
	{...restProps}
/>
