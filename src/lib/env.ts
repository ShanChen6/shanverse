const requiredEnv = (name: string): string => {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
};

export const getNotionEnv = () => ({
	token: requiredEnv("NOTION_TOKEN"),
	databaseId: requiredEnv("NOTION_DATABASE_ID"),
	postsDataSourceId: process.env.NOTION_POSTS_DATA_SOURCE_ID,
	categoriesDataSourceId: process.env.NOTION_CATEGORIES_DATA_SOURCE_ID,
	tagsDataSourceId: process.env.NOTION_TAGS_DATA_SOURCE_ID,
	projectsDataSourceId: process.env.NOTION_PROJECTS_DATA_SOURCE_ID,
	authorsDataSourceId: process.env.NOTION_AUTHORS_DATA_SOURCE_ID,
});
