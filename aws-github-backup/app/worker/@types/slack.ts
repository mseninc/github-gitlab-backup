type SlackSectionBlock = {
  type: "section";
  text: {
    type: "mrkdwn";
    text: string;
  };
};

type SlackHeaderBlock = {
  type: "header";
  text: {
    type: "plain_text";
    text: string;
    emoji: boolean;
  };
};

type SlackDividerBlock = {
  type: "divider";
};

type SlackBlock = SlackSectionBlock | SlackHeaderBlock | SlackDividerBlock;

type SlackAttachment =
  | {
      color: string;
      author_name: string;
      title: string;
      title_link: string;
      fields: {
        title: string;
        value: string;
        short: boolean;
      }[];
      thumb_url: string;
      footer: string;
      footer_icon: string;
    }
  | {
      color: string;
      blocks: SlackBlock[];
    };

type SlackPostRequestBody = {
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
};
