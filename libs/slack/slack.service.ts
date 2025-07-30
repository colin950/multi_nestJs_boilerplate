import { Injectable, Logger } from '@nestjs/common'
import { IncomingWebhook } from '@slack/webhook'
import { ConfigService } from '@nestjs/config'
import { SlackColor } from '../constant'

interface SlackField {
  type: 'mrkdwn'
  text: string
  verbatim?: boolean
}

interface SlackBlock {
  type: 'section' | 'header' | 'context'
  text?: { type: 'plain_text' | 'mrkdwn'; text: string; emoji?: boolean }
  fields?: SlackField[]
  elements?: { type: 'mrkdwn'; text: string }[]
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name)
  private readonly slack: IncomingWebhook
  private readonly MAX_TEXT_LENGTH = 1000
  private readonly serverName: string

  constructor(private readonly configService: ConfigService) {
    const slackWebhookUrl = this.configService.get<string>(
      'slack.serverAlarmWebhookUrl',
    )
    if (!slackWebhookUrl) {
      this.logger.warn(
        'Missing SLACK_SERVER_ALARM_WEBHOOK_URL environment variable',
      )
    } else {
      this.slack = new IncomingWebhook(slackWebhookUrl)
    }
    this.serverName = process.env.SERVER_NAME ? process.env.SERVER_NAME : 'air-bot-unknown'
  }

  async sendErrorMessageSlack(
    color: SlackColor,
    jobName: string,
    bodySection?: any,
  ) {
    if (!this.slack) {
      return
    }
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `[${this.serverName}] alerts :check:`,
          emoji: true,
        },
      },
    ]

    if (bodySection) {
      blocks.push(this.formatBlock(bodySection))
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `JobName: ${jobName}, Date: ${new Date().toISOString()}`,
        },
      ],
    })

    await this.slack.send({
      attachments: [
        {
          color: color.toString(),
          blocks,
        },
      ],
    })
  }

  private formatBlock(data: any): SlackBlock {
    const trimText = (text: string) => {
      if (text.length > this.MAX_TEXT_LENGTH) {
        return `${text.slice(0, this.MAX_TEXT_LENGTH)}...\n(중략)`
      }
      return text
    }

    if (Array.isArray(data)) {
      const fields: SlackField[] = data.map(
        (item, index): SlackField => ({
          type: 'mrkdwn',
          text: `Message-${index}:\n\n${trimText(JSON.stringify(item))}`,
          verbatim: false,
        }),
      )

      return {
        type: 'section',
        fields,
      }
    }

    if (typeof data === 'object' && data !== null) {
      return {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `Message:\n\n${trimText(JSON.stringify(data, null, 2))}`,
          },
        ],
      }
    }

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: trimText(String(data)),
      },
    }
  }
}
