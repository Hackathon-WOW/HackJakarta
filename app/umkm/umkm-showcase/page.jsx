import ShowcaseModule from "@/components/modules/ShowcaseModule";

export const metadata = {
	title: "UMKM Showcase",
	description:
		"Welcome to UMKM Showcase, where you can find various UMKM businesses from all over Indonesia.",
	icons: {
		icon: "/logo-white.svg",
	},
};

export default function Page() {
	return (
		<ShowcaseModule query="" currentPage={0} />
	);
}
