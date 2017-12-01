<?php 
    include './globalvariable.php';
    $data = $_POST['data'];
    $data = json_decode($data, true);
    /*
     * edit data manipulate
     */
    echo json_encode(array(
        'code' => 200,
        'message' => 'edit success',
        'data' => $data
    ));
?>