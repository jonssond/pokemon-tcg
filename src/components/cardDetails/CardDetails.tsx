import { Box, Container, Typography } from "@mui/material"

type cardDetailsProps = {
    pokemonName: string,
    pokemonType: string[]
}

export const CardDetails = (props: cardDetailsProps) => {
    return (
        <Container sx={{
            position: 'absolute',
            top: '30%',
            width: 'fit-content',
            height: 'fit-content',
            right: '20%',
            translateY: '50%',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            margin: '4px 8px',
            backgroundColor: 'grey',
            borderRadius: '20px'
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                <Typography sx={{
                    fontWeight: 'bolder',
                    textAlign: 'center'
                }}>{props.pokemonName}</Typography>
                {props.pokemonType.map((type) => {
                    console.log(type);
                    return (
                        <Typography key={type} sx={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}>
                            {type}
                        </Typography>
                    );
                })}
            </Box> 
        </Container>
    )
}