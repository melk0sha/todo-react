import React, { Component } from "react";
import Input from "./components/Input";
import TodoList from "./components/TodoList";
import Status from "./components/Status";
import Search from "./components/Search";
import Filter from "./components/Filter";
import Footer from "./components/Footer";
import filterValues from "./constants/filterValues";
import keyCode from "./constants/keyCode";
import events from "./constants/events";
import "./assets/styles/index.scss";

export default class App extends Component {
  state = {
    inputValue: "",
    searchValue: localStorage.getItem("searchValue") || "",
    todoList: JSON.parse(localStorage.getItem("todoList")) || [],
    activeFilter: localStorage.getItem("activeFilter") || filterValues.ALL
  };

  componentDidUpdate() {
    const { searchValue, todoList, activeFilter } = this.state;

    window.addEventListener("beforeunload", () => {
      localStorage.setItem("searchValue", searchValue);
      localStorage.setItem("todoList", JSON.stringify(todoList));
      localStorage.setItem("activeFilter", activeFilter);
    });
  }

  handleFiltering = (value, activeFilter) => {
    const { todoList } = this.state;

    todoList.forEach((todoItem) => {
      switch (activeFilter) {
        default:
        case filterValues.ALL:
          todoItem.visible = todoItem.value.toLowerCase().includes(value);
          break;
        case filterValues.TODO:
          todoItem.visible =
            todoItem.value.toLowerCase().includes(value) && !todoItem.done;
          break;
        case filterValues.DONE:
          todoItem.visible =
            todoItem.value.toLowerCase().includes(value) && todoItem.done;
          break;
      }
    });

    return todoList;
  };

  onSearchChange = ({ target: { value } }) => {
    const { handleFiltering } = this;
    const { activeFilter } = this.state;
    const todoList = handleFiltering(value.toLowerCase(), activeFilter);

    this.setState({ searchValue: value, todoList });
  };

  onFilterClick = ({ target: { textContent } }) => {
    textContent = textContent.replace(/\s/g, "").toLowerCase();
    const { handleFiltering } = this;
    const { searchValue } = this.state;
    const todoList = handleFiltering(searchValue.toLowerCase(), textContent);

    this.setState({ todoList, activeFilter: textContent });
  };

  onInputChange = ({ key, target: { type, value } }) => {
    const { inputValue, todoList } = this.state;

    if (
      (key === keyCode.ENTER && inputValue) ||
      (type === events.SUBMIT && inputValue)
    ) {
      todoList.push({ value: inputValue, done: false, visible: true });
      this.setState({ inputValue: "", todoList });
    } else {
      this.setState({ inputValue: value });
    }
  };

  onDeleteClick = (event) => {
    event.stopPropagation();
    const {
      target: {
        parentElement: {
          dataset: { id }
        }
      }
    } = event;
    let { todoList } = this.state;

    todoList = todoList.filter((todoItem, idx) => idx !== +id);
    this.setState({ todoList });
  };

  onTodoItemClick = ({
    currentTarget: {
      dataset: { id }
    }
  }) => {
    const { todoList } = this.state;
    const todoIndex = todoList.findIndex((todoItem, idx) => idx === +id);

    todoList[todoIndex].done = !todoList[todoIndex].done;
    this.setState({ todoList });
  };

  render() {
    const {
      onSearchChange,
      onFilterClick,
      onInputChange,
      onDeleteClick,
      onTodoItemClick
    } = this;
    const { inputValue, searchValue, todoList, activeFilter } = this.state;
    const doneTodos = todoList.filter(
      (todoItem) => todoItem.done && todoItem.visible
    ).length;
    const totalTodos = todoList.filter((todoItem) => todoItem.visible).length;

    return (
      <>
        <div className="todo-container">
          <Status doneTodos={doneTodos} totalTodos={totalTodos} />
          <div className="todo-widget">
            <Search searchValue={searchValue} onSearchChange={onSearchChange} />
            <Filter activeFilter={activeFilter} onFilterClick={onFilterClick} />
          </div>
          <Input inputValue={inputValue} onInputChange={onInputChange} />
          <TodoList
            todoList={todoList}
            onDeleteClick={onDeleteClick}
            onTodoItemClick={onTodoItemClick}
          />
        </div>
        <Footer />
      </>
    );
  }
}
