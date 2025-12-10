import { useCallback, useState } from 'react'
import { useMutation, useSubscription } from '@apollo/client'
import {
  MESSAGE_ADDED_SUBSCRIPTION,
  SETTINGS_UPDATED_SUBSCRIPTION,
  SYSTEM_STATUS_SUBSCRIPTION,
  SEND_MESSAGE_MUTATION,
} from '../graphql/operations'

export type Message = {
  id: string
  text: string
  createdAt: string
  author: string
  channel: string
  important: boolean
  tags: string[]
}

export type SystemStatus = {
  online: boolean
  load: number
  updatedAt: string
}

export type Settings = {
  theme: string
  lang: string
  updatedAt: string
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [sendMessageMutation, { loading: sending }] = useMutation(SEND_MESSAGE_MUTATION)

  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newMessage = data.data?.messageAdded as Message | undefined
      if (!newMessage) return

      setMessages((prev) => {
        const exists = prev.some((message) => message.id === newMessage.id)
        if (exists) return prev
        return [...prev, newMessage]
      })
    },
  })

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      await sendMessageMutation({ variables: { text: trimmed } })
    },
    [sendMessageMutation]
  )

  return { messages, sendMessage, sending }
}

export const useSystemStatus = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null)

  useSubscription(SYSTEM_STATUS_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newStatus = data.data?.systemStatusChanged as SystemStatus | undefined
      if (!newStatus) return
      setStatus(newStatus)
    },
  })

  return status
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null)

  useSubscription(SETTINGS_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const newSettings = data.data?.settingsUpdated as Settings | undefined
      if (!newSettings) return
      setSettings(newSettings)
    },
  })

  return settings
}
