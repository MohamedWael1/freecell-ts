import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
    useEffect,
    useReducer,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import game, { Card, Foundation, FreeCell, Pillar } from "@/Deck/game";
import { motion, useDragControls } from "framer-motion";

export default function Home() {
    const [isGameInit, setIsGameInit] = useState(false);
    const [, setForceUpdate] = useReducer((x) => x + 1, 0);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    console.log(selectedCards);
    const handleSelect = (
        card: Card,
        cardContract: Pillar | FreeCell | Foundation
    ) => {
        if (selectedCards.length === 0) {
            setSelectedCards(
                selectCards(card, cardContract) as unknown as Card[]
            );
        }
    };

    const handleInsertion = (cardContract: Pillar | FreeCell | Foundation) => {
        if (selectedCards.length > 0) {
            insertCards(
                selectedCards,
                cardContract,
                getOriginalCardContract() as Pillar | FreeCell | Foundation
            );
            setSelectedCards([]);
        }
    };

    const handleStart = () => {
        game.start();
        setIsGameInit(true);
    };

    const isDraggable = (
        card: Card,
        cardContract: Pillar | FreeCell | Foundation
    ): boolean => {
        return !!game.selectCards(card, cardContract);
    };

    const selectCards = (
        card: Card,
        cardContract: Pillar | FreeCell | Foundation
    ) => {
        setOriginalCardContract(cardContract);
        return game.selectCards(card, cardContract);
    };

    const insertCards = (
        cards: Card[],
        cardContract: Pillar | FreeCell | Foundation,
        originalCardContract: Pillar | FreeCell | Foundation
    ) => {
        game.insertCard(cards, cardContract, originalCardContract);
    };

    const setOriginalCardContract = (
        cardContract: Pillar | FreeCell | Foundation
    ) => {
        return game.setOriginalCardContract(cardContract);
    };

    const getOriginalCardContract = () => {
        return game.getOriginalCardContract();
    };

    useEffect(() => {
        const unsubscribe = game.addListener(setForceUpdate);
        return () => {
            unsubscribe();
        };
    }, [setForceUpdate]);

    return (
        <div className="min-h-screen bg-green-500 p-4">
            <div>
                <button
                    className="bottom-8 right-8 bg-pink-500 text-white p-2 rounded-md  fixed"
                    onClick={handleStart}
                >
                    Start
                </button>
            </div>

            <div className="flex">
                <div className="flex pt-8 pb-12 w-full">
                    {game.getFreeCells().map((freeCell, index) => (
                        <div
                            key={index}
                            className="border border-white max-w-[100px] min-h-[150px] rounded-md w-full mr-2"
                            onClick={() => {
                                handleSelect(freeCell.getCards()[0], freeCell);
                                handleInsertion(freeCell);
                            }}
                        >
                            {freeCell.getCards().map((card, index) => (
                                <div key={card.id}>
                                    <Image
                                        src={card.img}
                                        key={card.img}
                                        alt={card.img}
                                        height={10}
                                        width={100}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex  pt-8 pb-12 w-full">
                    {game.getFoundations().map((foundation, index) => (
                        <div
                            key={index}
                            className="border border-white max-w-[100px] min-h-[150px] rounded-md w-full mr-2 relative"
                            onClick={() => {
                                handleSelect(
                                    foundation.getCards()[0],
                                    foundation
                                );
                                handleInsertion(foundation);
                            }}
                        >
                            {foundation.getCards().map((card, index) => (
                                <div key={card.id} className="absolute">
                                    <Image
                                        src={card.img}
                                        key={card.img}
                                        alt={card.img}
                                        height={10}
                                        width={100}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-8">
                {game.getPillars().map((pillar, index) => {
                    return (
                        <div
                            className=" relative border border-white max-w-[100px] min-h-[150px] rounded-md "
                            key={index}
                            onClick={() => {
                                if(pillar.isEmpty()){
                                    handleSelect(pillar.getCards()[0], pillar);
                                    handleInsertion(pillar);
                                } 
                            }}
                        >
                            {pillar.getCards().map((card, i) => {
                                return (
                                    <motion.div
                                        key={card.id}
                                        className={`absolute
                                         ${
                                             card.isSelected
                                                 ? `shadow-lg shadow-slate-50  `
                                                 : ""
                                         }`}
                                        onClick={() => {
                                            handleSelect(card, pillar);
                                            handleInsertion(pillar);
                                        }}
                                        style={{ top: `${i * 50}px` }}
                                    >
                                        <Image
                                            src={card.img}
                                            alt={card.img}
                                            height={10}
                                            width={100}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
