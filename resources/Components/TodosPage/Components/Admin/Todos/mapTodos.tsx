import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadedAnimation from "../../../../../Loader/Animations/LoadedAnimation";
import TodoItem from "../../TodoItem";
import { fetchTodos } from '../../../../../api/todos/api';

export const MapTodos: React.FC = () => {
    const [todos, setTodos] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTodos = async () => {
            const fetchedTodos = await fetchTodos();
            setTodos(fetchedTodos);
        };

        loadTodos();
    }, []);

    return (
        <div className="todos">
            <LoadedAnimation>
                <div className="todo-list">
                    {todos.map((todo) => (
                        <TodoItem key={todo.todoId} todo={todo} />
                        ))}
                </div>
            </LoadedAnimation>
        </div>
    );
};
