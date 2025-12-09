import { gql } from '@apollo/client'

export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    messageAdded {
      id
      text
      createdAt
      author
      channel
      important
      tags
    }
  }
`

export const SYSTEM_STATUS_SUBSCRIPTION = gql`
  subscription OnSystemStatusChanged {
    systemStatusChanged {
      online
      load
      updatedAt
    }
  }
`

export const SETTINGS_UPDATED_SUBSCRIPTION = gql`
  subscription OnSettingsUpdated {
    settingsUpdated {
      theme
      lang
      updatedAt
    }
  }
`

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($text: String!) {
    sendMessage(text: $text) {
      id
      text
      createdAt
      author
      channel
      important
      tags
    }
  }
`
