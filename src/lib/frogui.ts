import { createSystem } from 'frog/ui'

export const {
    Box,
    Columns,
    Column,
    Divider,
    Heading,
    HStack,
    Icon,
    Image,
    Rows,
    Row,
    Spacer,
    Text,
    VStack,
    vars,
} = createSystem({
    colors: {
        text: '#6B21A8',
        background: '#DEDDFF',
        blue: '#0070f3',
        green: '#00ff00',
        red: '#ff0000',
        orange: '#ffaa00',
        white: '#ffffff',
    },
    fonts: {
        default: [
            {
                name: 'Open Sans',
                source: 'google',
                weight: 400,
            },
            {
                name: 'Open Sans',
                source: 'google',
                weight: 600,
            },
        ],
        madimi: [
            {
                name: 'Madimi One',
                source: 'google',
            },
        ],
    },
})